import type { Route } from "./+types/dashboard";
import { useLoaderData } from 'react-router';
import { pool } from '~/db.server';
import AppInstallsTable from "./appInstalls";
import type * as Globals from '../globals';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "AppMarket Stats" },
    { name: "description", content: "Statistics for AppMarket" },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const appInstalls = await pool.query<Globals.App>(`
    WITH latest_sync AS (
      SELECT MAX(sync_id) AS sync_id FROM instances
    )
    SELECT apps.id, apps.name, COUNT(instances.application_id)::int AS instance_count
    FROM applications AS apps
    LEFT JOIN instances
      ON instances.application_id = apps.id
      AND instances.sync_id = (SELECT sync_id FROM latest_sync)
    WHERE apps.sync_id = (SELECT sync_id FROM latest_sync)
    GROUP BY apps.id, apps.name
    ORDER BY instance_count DESC;
    `);
  const clusters = await pool.query<Globals.Cluster>(`
    SELECT * FROM applications
WHERE sync_id = (SELECT MAX(sync_id) FROM applications);
    `);
  const applications = await pool.query<Globals.Instance>(`
 SELECT * FROM applications
WHERE sync_id = (SELECT MAX(sync_id) FROM applications);
    `);

  return { applications: applications.rows, clusters: clusters.rows, appInstalls: appInstalls.rows };
}

export default function Home() {
    const { applications, clusters, appInstalls } = useLoaderData<typeof loader>();
  console.log("AppInstalls: ", appInstalls);
    return (
    <div>
      <h1>Current distribution</h1>
      Click each app to see the clusters where it is installed.
      <AppInstallsTable appInstalls={appInstalls} />
    </div>
  );
}
