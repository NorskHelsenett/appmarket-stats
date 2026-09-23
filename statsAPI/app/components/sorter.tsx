import { useMemo, useState } from "react";

export type SortDir = "asc" | "desc";

export function useSortableRows<T>(rows: T[], initialKey: keyof T, initialDir: SortDir = "asc") {
  const [sortKey, setSortKey] = useState<keyof T>(initialKey);
  const [sortDir, setSortDir] = useState<SortDir>(initialDir);

  const sorted = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const cmp =
        typeof av === "number" && typeof bv === "number"
          ? av - bv
          : String(av).localeCompare(String(bv), "nb-NO", { sensitivity: "base", numeric: true });
      return sortDir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [rows, sortKey, sortDir]);

  function toggleSort(key: keyof T) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  return { sorted, sortKey, sortDir, toggleSort };
}

export function SortableHeader<T>({
  label,
  column,
  sortKey,
  sortDir,
  onSort,
  align = "left",
}: {
  label: string;
  column: keyof T;
  sortKey: keyof T;
  sortDir: SortDir;
  onSort: (column: keyof T) => void;
  align?: "left" | "right";
}) {
  const active = sortKey === column;
  return (
    <th
      onClick={() => onSort(column)}
      className={`${
        align === "right" ? "text-right" : "text-left"
      } py-3 px-4 text-white font-semibold tracking-[0.2px] cursor-pointer select-none whitespace-nowrap`}
      title="Click to sort"
    >
      {label} {active ? (sortDir === "desc" ? "▼" : "▲") : ""}
    </th>
  );
}