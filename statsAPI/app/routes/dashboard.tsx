import type { Route } from "./+types/dashboard";
import { Welcome } from "../welcome/welcome";
import { useLoaderData } from 'react-router';
import { pool } from '~/db.server';

interface App {
  id: number;
  name: string;
}

interface Cluster {
  id: number;
  name: string;
}

interface Instance {
  id: number;
  application_id: string;
  cluster_id: string;
    billable: boolean;
}
export function meta({}: Route.MetaArgs) {
  return [
    { title: "AppMarket Stats" },
    { name: "description", content: "Statistics for AppMarket" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const appInstalls = await pool.query<App>(`
    SELECT apps.id, apps.name, COUNT(instances.application_id)::int AS instance_count
    FROM applications AS apps
    LEFT JOIN instances ON instances.application_id = apps.id
    GROUP BY apps.id, apps.name
    ORDER BY instance_count DESC;
    `);
  const clusters = await pool.query<Cluster>('SELECT id, name FROM clusters ORDER BY id;');
  const instances = await pool.query<Instance>('SELECT id, application_id, cluster_id FROM instances ORDER BY application_id;');

  return { instances: instances.rows, clusters: clusters.rows, appInstalls: appInstalls.rows };
}

export default function Home() {
    const { instances, clusters, appInstalls } = useLoaderData<typeof loader>();
  console.log("AppInstalls: ", appInstalls);
    return (
    <div>
      <h1>Current distribution</h1>
      <ul>
        {appInstalls.map((app: any) => (
          <li key={app.id}>
            {app.name}: installert i {app.instance_count} clustere.
          </li>
        ))}
      </ul>
    </div>
  );
  return <Welcome />;

}
