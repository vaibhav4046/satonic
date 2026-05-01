import "server-only";
import { db, schema } from "@/lib/data/db";
import { nowIso } from "@/lib/utils";
import type { Lead } from "@/lib/types";

export type SuppressionKind = "email" | "domain" | "phone";

export async function addSuppression(
  identifier: string,
  kind: SuppressionKind,
  reason?: string
): Promise<void> {
  await db
    .insert(schema.suppression)
    .values({
      identifier: identifier.toLowerCase(),
      kind,
      reason: reason ?? null,
      createdAt: nowIso(),
    })
    .onConflictDoNothing();
}

export async function loadSuppression(): Promise<Set<string>> {
  const rows = await db.select().from(schema.suppression);
  return new Set(rows.map((r) => r.identifier));
}

export async function filterSuppressed(leads: Lead[]): Promise<Lead[]> {
  const set = await loadSuppression();
  if (set.size === 0) return leads;
  return leads.filter((l) => {
    if (l.email && set.has(l.email.toLowerCase())) return false;
    if (l.phone && set.has(l.phone)) return false;
    if (l.website) {
      try {
        const host = new URL(l.website.startsWith("http") ? l.website : `https://${l.website}`)
          .hostname.replace(/^www\./, "")
          .toLowerCase();
        if (set.has(host)) return false;
      } catch {
        /* skip */
      }
    }
    return true;
  });
}

export async function ingestCsv(csv: string): Promise<{ added: number }> {
  const lines = csv.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  let added = 0;
  for (const raw of lines) {
    const cell = raw.split(",")[0]?.trim();
    if (!cell) continue;
    const lower = cell.toLowerCase();
    let kind: SuppressionKind = "domain";
    if (lower.includes("@")) kind = "email";
    else if (/^\+?\d[\d\s\-()]+$/.test(lower)) kind = "phone";
    await addSuppression(lower, kind, "csv_import");
    added++;
  }
  return { added };
}
