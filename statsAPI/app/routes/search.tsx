import { useMemo, useState } from "react";

export function useTableSearch<T>(rows: T[], columns: (keyof T)[]) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((row) =>
      columns.some((col) => String(row[col] ?? "").toLowerCase().includes(q))
    );
  }, [rows, columns, query]);

  return { query, setQuery, filtered };
}

// TableSearch.tsx
export function TableSearch({
  value,
  onChange,
  placeholder = "Search...",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="mb-4 w-full rounded-lg border border-brand-line bg-white px-4 py-2 text-sm text-brand-body placeholder:text-brand-body/50 focus:border-brand-header focus:outline-none focus:ring-2 focus:ring-brand-highlight"
    />
  );
}