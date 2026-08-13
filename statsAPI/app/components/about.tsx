import { Link } from "react-router-dom";
import { pool } from '~/db.server';
import type { Route } from "./+types/about";

const usefulLinks = [
  { label: "Dokumentasjon", href: "https://docs.sky.nhn.no/k8s/brukerdokumentasjon/appmarket/index.html", description: "Kom i gang og se hvordan AppMarket fungerer." },
  { label: "Brukerstøtte", href: "https://norskhelsenett.slack.com/archives/C06JVT4LUCV", description: "Få hjelp eller meld inn en feil." },
  { label: "Kildekode", href: "https://helsegitlab.nhn.no/apps/appmarket", description: "AppMarket Repository." },
  { label: "Kildekode", href: "https://helsegitlab.nhn.no/appmarket/usagegui", description: "Repository for denne siden." },
];

function formatSyncTime(nanoseconds: string | number | null): string {
  if (!nanoseconds) return "Ukjent";
  const ns = BigInt(nanoseconds);
  const ms = ns / 1_000_000n;
  const date = new Date(Number(ms));
  return date.toLocaleString("nb-NO", { dateStyle: "short", timeStyle: "medium" });
}

export async function loader() {
  const result = await pool.query<{ last_sync_id: string }>(
    "SELECT MAX(sync_id) AS last_sync_id FROM instances;"
  );
  return { lastRun: result.rows[0]?.last_sync_id ?? null };
}

export default function About({ loaderData }: Route.ComponentProps) {
    const { lastRun } = loaderData;

  return (
    <div className="w-full max-w-[960px] mx-auto">
      <header className="flex items-center gap-4 rounded-lg bg-brand-header px-6 py-5 shadow-[0_1px_3px_rgba(0,41,32,0.08)]">
        <div className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-white/15 text-white">
          <svg viewBox="0 0 48 48" className="h-6 w-6" xmlns="http://www.w3.org/2000/svg">
            <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="none" />
            <circle cx="24" cy="15" r="2.6" fill="currentColor" />
            <path d="M24 22 L24 34" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-brand-highlight">Om</p>
          <h1 className="text-xl font-semibold text-white">AppMarket</h1>
        </div>
      </header>
  <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-body no-underline hover:text-brand-header"
      >
        <span aria-hidden="true">←</span>
        Tilbake
      </Link>
      <section className="mb-6 rounded-lg border border-brand-line bg-white px-6 py-5 shadow-[0_1px_3px_rgba(0,41,32,0.08)]">
        <h2 className="mb-2 text-lg font-semibold text-brand-header">Hva er denne siden?</h2>
        <p className="text-sm leading-relaxed text-brand-body">
Denne siden inneholder statistikk over hvilke cluster som har installert hver applikasjon som inngår i katalogen til AppMarket.
Datene hentes fra ROR-API og datasettene på denne siden oppdateres automatisk hver natt via en cron-jobb.  <br />
Denne siden og tilhørende støttekomponenter kjører i d-app-001-trd1-app.sky.nhn.no
        </p>
      </section>

      <section className="mb-6 rounded-lg border border-brand-line bg-white px-6 py-5 shadow-[0_1px_3px_rgba(0,41,32,0.08)]">
        <h2 className="mb-3 text-lg font-semibold text-brand-header">Nyttige lenker</h2>
        <ul className="divide-y divide-brand-line">
          {usefulLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="flex items-center justify-between gap-4 rounded-md px-2 py-3 no-underline transition-colors hover:bg-brand-highlight"
              >
                <div>
                  <p className="text-sm font-medium text-brand-body">{link.label}</p>
                  <p className="text-xs text-brand-body/70">{link.description}</p>
                </div>
                <span aria-hidden="true" className="flex-none text-brand-header">→</span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-6">
        <h2 className="mb-3 text-lg font-semibold text-brand-header">Datasett og synkronisering</h2>
        <table className="w-full table-fixed border-collapse text-sm text-brand-body shadow-[0_1px_3px_rgba(0,41,32,0.08)] rounded-lg overflow-hidden">
          <colgroup>
            <col style={{ width: "28%" }} />
            <col style={{ width: "24%" }} />
            <col style={{ width: "24%" }} />
            <col style={{ width: "24%" }} />
          </colgroup>
          <thead>
            <tr className="bg-brand-header">
              <th className="text-left py-3 px-4 text-white font-semibold tracking-[0.2px]">Datasett</th>
              <th className="text-left py-3 px-4 text-white font-semibold tracking-[0.2px]">Kilde</th>
              <th className="text-left py-3 px-4 text-white font-semibold tracking-[0.2px]">Frekvens</th>
              <th className="text-left py-3 px-4 text-white font-semibold tracking-[0.2px]">Siste kjøring</th>
            </tr>
          </thead>
          <tbody>
              <tr
                className={`border-b border-brand-line`}
              >
                <td className="py-2.5 px-4 font-medium">Apper, clustere og instances</td>
                <td className="py-2.5 px-4">ROR-API</td>
                <td className="py-2.5 px-4">Hver natt</td>
                <td className="py-2.5 px-4 tabular-nums">{formatSyncTime(lastRun)}</td>
              </tr>
            
          </tbody>
        </table>
        <p className="mt-2 text-xs text-brand-body/60">
          Tidspunkt for siste kjøring oppdateres automatisk etter hver synkronisering.
        </p>
      </section>
    </div>
  );
}