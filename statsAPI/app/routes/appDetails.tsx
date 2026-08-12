import type * as Globals from '../globals';
import type { Route } from "./+types/appDetails";
import { pool } from '~/db.server';
import { Link } from "react-router";
import { useSortableRows, SortableHeader } from "./sorter";
import { TableSearch, useTableSearch } from "./search";

export async function loader({ params }: Route.LoaderArgs) {
const appInstalls = await pool.query<Globals.AppInstall>(
    "SELECT * FROM instances WHERE application_id = $1 AND sync_id = (SELECT MAX(sync_id) FROM applications);",
  [params.id]
    );

const app = await pool.query<Globals.App>(
    "SELECT * FROM applications WHERE id = $1;",
  [params.id]
    );

const clusterIds = appInstalls.rows.map((row) => row.cluster_id);

const clusters = await pool.query<Globals.Cluster>( "SELECT * FROM clusters WHERE id = ANY($1)",
  [clusterIds]);
  return { clusters: clusters.rows, appInstalls: appInstalls.rows, app: app.rows[0] };
}

export default function AppDetails({ loaderData }: Route.ComponentProps) {
  const { clusters, app } = loaderData;
  const { sorted, sortKey, sortDir, toggleSort } = useSortableRows(clusters, "name");
  const { query, setQuery, filtered } = useTableSearch(sorted, [
    "name",
    "workspace",
    "environment",
  ]);
  return (
   <div>

     <div className="w-full max-w-[960px]">

      <header className="flex items-center gap-4 rounded-lg bg-brand-header px-6 py-5 shadow-[0_1px_3px_rgba(0,41,32,0.08)]">
        <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-white/15 text-lg font-semibold text-white">
          {app.name.charAt(0).toUpperCase()}
        </div>

        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-brand-highlight">
            Application
          </p>
          <h1 className="truncate text-xl font-semibold text-white">
            {app.name}
          </h1>
        </div>

        {typeof clusters.length === "number" && (
          <span className="ml-auto flex-none rounded-full bg-white/15 px-3 py-1 text-sm font-medium text-white">
            {clusters.length} {clusters.length === 1 ? "cluster" : "clusters"}
          </span>
        )}
      </header>
         <Link
        to={"/"}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-body no-underline hover:text-brand-header"
      >
        <span aria-hidden="true">←</span>
        Back
      </Link>
    </div>
             <TableSearch value={query} onChange={setQuery} placeholder="Search..." />

   <table className="w-full max-w-[960px] mx-auto table-fixed border-collapse text-sm text-brand-body font-sans shadow-[0_1px_3px_rgba(0,41,32,0.08)] rounded-lg overflow-hidden">
  <colgroup>
    <col className="w-1/2" />
    <col className="w-1/2" />    
    <col className="w-1/2" />
  </colgroup>
  <thead>
    <tr className="bg-brand-header">
<SortableHeader label="Cluster" column="name" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
            <SortableHeader label="Workspace" column="workspace" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
            <SortableHeader label="Environment" column="environment" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
    </tr>
  </thead>
  <tbody>
    {filtered.map((row, i) => (
      <tr
        key={row.name}
        className={`${i % 2 === 1 ? "bg-brand-stripe" : "bg-white"} hover:bg-brand-highlight border-b border-brand-line transition-colors duration-150`}
      >
        <td className="py-2.5 px-4 text-left">
            {row.name}
        </td>
        <td className="py-2.5 px-4 text-left">
              {row.workspace}
        </td>
         <td className="py-2.5 px-4 text-left">
              {row.environment}
        </td>
      </tr>
    ))}
  </tbody>
</table> </div>  
  );
}