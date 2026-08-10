import { useMemo, useState } from "react";
import type * as Globals from '../globals';
import { Link } from "react-router";

// ---- Data shape ----


// Example data — swap for your real appInstalls dataset
const exampleData: AppInstall[] = [
  { app: "Kjernejournal", installs: 84210 },
  { app: "Helsenorge", installs: 76540 },
  { app: "E-resept", installs: 61200 },
  { app: "Digital hjemmeoppfølging", installs: 39870 },
  { app: "Pasientreiser", installs: 28430 },
  { app: "Videokonsultasjon", installs: 15600 },
];

// ---- NHN brand palette ----
const theme = {
  headerBg: "#015945", // Mørk grønn primær
  headerText: "#FFFFFF",
  bodyText: "#002920", // Grønn 1 — near-black, on-brand instead of pure black
  rowStripe: "#F7F5F4", // Varm grå
  rowHover: "#C4F2DA", // Grønn 4
  border: "#DCDDDE", // Grå 3
  barTrack: "#C4F2DA", // Grønn 4
  barFill: "#02A67F", // Grønn 3
  activeAccent: "#02A67F", // Grønn 3, for the active sort indicator
};

type SortDir = "asc" | "desc";

interface AppInstalls {
appInstalls: Globals.App[]
}

export default function AppInstallsTable({ appInstalls }: AppInstalls) {
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const sorted = useMemo(
    () => [...appInstalls].sort((a, b) => (sortDir === "desc" ? b.instance_count - a.instance_count : a.instance_count - b.instance_count)),
    [appInstalls, sortDir]
  );

  const maxInstalls = useMemo(() => Math.max(...appInstalls.map((d) => d.instance_count)), [appInstalls]);

  return (
    <table
      style={{
        borderCollapse: "collapse",
        width: "100%",
        // Scales with the viewport but caps out — beyond ~960px a 2-column
        // table starts leaving dead space rather than becoming more readable.
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
      <colgroup>
        <col style={{ width: "50%" }} />
        <col style={{ width: "50%" }} />
      </colgroup>
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
            App
          </th>
          <th
            onClick={() => setSortDir(sortDir === "desc" ? "asc" : "desc")}
            style={{
              textAlign: "right",
              padding: "12px 16px",
              color: theme.headerText,
              fontWeight: 600,
              letterSpacing: 0.2,
              cursor: "pointer",
              userSelect: "none",
              whiteSpace: "nowrap",
            }}
            title="Click to sort"
          >
            Install Count {sortDir === "desc" ? "▼" : "▲"}
          </th>
        </tr>
      </thead>
      <tbody>
        {sorted.map((row, i) => (
          <tr
            key={row.name}
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
            <td style={{ padding: "10px 16px", fontWeight: 500 }}>
<Link to={`app/${row.id}`} style={{ color: theme.bodyText, textDecoration: "none" }}>
    {row.name}
  </Link>

            </td>
            <td style={{ padding: "10px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10 }}>
                {/* sequential single-hue magnitude bar — grows with the column instead of
                    staying a fixed width, so wider screens get better resolution between
                    close values rather than just empty space */}
                <div
                  style={{
                    flex: "1 1 auto",
                    minWidth: 60,
                    maxWidth: 320,
                    height: 6,
                    borderRadius: 3,
                    backgroundColor: theme.barTrack,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${(row.instance_count / maxInstalls) * 100}%`,
                      height: "100%",
                      backgroundColor: theme.barFill,
                      borderRadius: 3,
                    }}
                  />
                </div>
                <span
                  style={{
                    flex: "0 0 auto",
                    fontVariantNumeric: "tabular-nums",
                    minWidth: 56,
                    textAlign: "right",
                  }}
                >
                  {row.instance_count.toLocaleString("nb-NO")}
                </span>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
