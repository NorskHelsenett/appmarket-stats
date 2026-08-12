import { useMemo } from "react";
import type * as Globals from '../globals';
import { Link } from "react-router";
import { useSortableRows, SortableHeader } from "./sorter";

interface AppInstalls {
appInstalls: Globals.App[]
}

function AboutLink({ to = "/about" }: { to?: string }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-brand-body no-underline transition-colors hover:bg-brand-highlight hover:text-brand-header"
    >
      <svg viewBox="0 0 48 48" className="h-5 w-5 flex-none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="none" />
        <circle cx="24" cy="15" r="2.6" fill="currentColor" />
        <path d="M24 22 L24 34" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      </svg>
      Om siden
    </Link>
  );
}

export default function AppInstallsTable({ appInstalls }: AppInstalls) {
  const maxInstalls = useMemo(() => Math.max(...appInstalls.map((d) => d.instance_count)), [appInstalls]);
  const { sorted, sortKey, sortDir, toggleSort } = useSortableRows(appInstalls, "name");

  return (
    <div>
<div className="flex flex-wrap items-center justify-between gap-4">
  <img src="/logo.svg" alt="AppMarket" className="w-[240px] min-w-[200px] max-w-[90vw] h-auto flex-shrink-0" />
  <AboutLink />
</div>
<table className="w-full max-w-[960px] mx-auto table-fixed border-collapse text-sm text-brand-body font-sans shadow-[0_1px_3px_rgba(0,41,32,0.08)] rounded-lg overflow-hidden">
  <colgroup>
    <col className="w-1/2" />
    <col className="w-1/2" />
  </colgroup>
  <thead>
    <tr className="bg-brand-header">
     <SortableHeader label="App" column="name" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
     <SortableHeader label="Installs" column="instance_count" sortKey={sortKey} sortDir={sortDir} onSort={toggleSort} />
    </tr>
  </thead>
  <tbody>
    {sorted.map((row, i) => (
      <tr
        key={row.name}
        className={`${i % 2 === 1 ? "bg-brand-stripe" : "bg-white"} hover:bg-brand-highlight border-b border-brand-line transition-colors duration-150`}
      >
        <td className="py-2.5 px-4 font-medium">
          <Link to={`app/${row.id}`} className="text-brand-body no-underline">
            {row.name}
          </Link>
        </td>
        <td className="py-2.5 px-4">
          <div className="flex items-center justify-end gap-2.5">
            <div className="flex-1 min-w-[60px] max-w-[320px] h-1.5 rounded-[3px] bg-brand-track overflow-hidden">
              <div
                className="h-full rounded-[3px] bg-brand-fill"
                style={{ width: `${(row.instance_count / maxInstalls) * 100}%` }}
              />
            </div>
            <span className="flex-none tabular-nums min-w-[56px] text-right">
              {row.instance_count.toLocaleString("nb-NO")}
            </span>
          </div>
        </td>
      </tr>
    ))}
  </tbody>
</table></div>
  );
}
