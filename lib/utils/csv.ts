import type { Lead } from "@/lib/types";

const HEADERS = [
  "name",
  "type",
  "email",
  "email_confidence",
  "phone",
  "website",
  "city",
  "country",
  "category",
  "primary_social",
  "score",
  "source",
  "fetched_at",
] as const;

function escape(v: string | number | null | undefined): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function leadsToCsv(leads: Lead[]): string {
  const rows: string[] = [HEADERS.join(",")];
  for (const l of leads) {
    rows.push(
      [
        escape(l.name),
        escape(l.type),
        escape(l.email),
        escape(l.email_confidence),
        escape(l.phone),
        escape(l.website),
        escape(l.location?.city ?? ""),
        escape(l.location?.country ?? ""),
        escape(l.category),
        escape(l.social[0]?.url ?? ""),
        escape(l.score),
        escape(l.source),
        escape(l.fetched_at),
      ].join(",")
    );
  }
  return rows.join("\n");
}

export function csvFilename(prefix = "satonic-leads"): string {
  const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  return `${prefix}-${ts}.csv`;
}
