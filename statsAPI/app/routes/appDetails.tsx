import { useRouteLoaderData, useParams } from "react-router";
import type * as Globals from '../globals';
import type { Route } from "./+types/appDetails";
import { pool } from '~/db.server';

export async function loader({ params }: Route.LoaderArgs) {

  const appInstalls = await pool.query<Globals.AppInstall>(
    "SELECT * FROM instances WHERE application_id = $1 AND sync_id = (SELECT MAX(sync_id) FROM applications);"  ,
  [params.id]
    );
const clusterIds = appInstalls.rows.map((row) => row.cluster_id);


  const clusters = await pool.query<Globals.Cluster>( "SELECT * FROM clusters WHERE id = ANY($1)",
  [clusterIds]);
  return { clusters: clusters.rows, appInstalls: appInstalls.rows };
}


export default function AppDetails({ loaderData }: Route.ComponentProps) {
  const { clusters } = loaderData;

  return (
   <div>
      <p>{clusters.length} clusters have this app installed</p>
   
    <table
      style={{
        borderCollapse: "collapse",
        width: "100%",
        maxWidth: 960,
        margin: "0 auto",
        tableLayout: "fixed",
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        fontSize: 14,
        color: theme.bodyText,
        boxShadow: "0 1px 3px rgba(0, 41, 32, 0.08)",
        borderRadius: 8,
        overflow: "hidden",
      }}
    >
      <thead>
        <tr style={{ backgroundColor: theme.headerBg }}>
          <th
            style={{
              textAlign: "left",
              padding: "12px 16px",
              color: theme.headerText,
              fontWeight: 600,
              letterSpacing: 0.2,
            }}
          >
            Cluster Name
          </th>
          {/* Add more <th> columns here as the dataset grows, e.g. Region, Status */}
        </tr>
      </thead>
      <tbody>
        {loaderData.clusters.map((cluster, i) => (
          <tr
            key={cluster.name}
            style={{
              backgroundColor: i % 2 === 1 ? theme.rowStripe : "#FFFFFF",
              borderBottom: `1px solid ${theme.border}`,
              transition: "background-color 120ms ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = theme.rowHover)}
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = i % 2 === 1 ? theme.rowStripe : "#FFFFFF")
            }
          >
            <td style={{ padding: "10px 16px", fontWeight: 500 }}>{cluster.name}</td>
            {/* Add more <td> cells here to match new columns above */}
          </tr>
        ))}
      </tbody>
    </table>  </div>  
  );
}

// Clusters that have a given application installed.
// Currently shows just the cluster name — structured so it's easy to add
// more metadata columns later (region, environment, status, install date, etc.)
// without reshaping the component.

interface ClusterInfo {
  name: string;
  // Add more fields here as your dataset grows, e.g.:
  // region?: string;
  // environment?: "prod" | "staging" | "dev";
  // status?: "active" | "inactive";
  // installedAt?: string;
}

// Example data — replace with the result of joining app_installs -> clusters
// on cluster_id, filtered to the application_id you care about.
const exampleClusters: ClusterInfo[] = [
  { name: "oslo-prod-01" },
  { name: "bergen-prod-02" },
  { name: "trondheim-staging-01" },
  { name: "tromso-prod-01" },
  { name: "stavanger-dev-01" },
];

// ---- NHN brand palette (same theme as AppInstallsTable) ----
const theme = {
  headerBg: "#015945", // Mørk grønn primær
  headerText: "#FFFFFF",
  bodyText: "#002920", // Grønn 1
  rowStripe: "#F7F5F4", // Varm grå
  rowHover: "#C4F2DA", // Grønn 4
  border: "#DCDDDE", // Grå 3
};

interface ClusterInstallsTableProps {
  clusters?: ClusterInfo[];
}