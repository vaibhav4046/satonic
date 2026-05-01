import "server-only";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/data/db";
import { hashString, nowIso } from "@/lib/utils";
import type { Lead } from "@/lib/types";

export async function recordQuery(prompt: string, intent: string): Promise<string> {
  const id = hashString(`${prompt}|${Date.now()}`);
  const normalized = prompt.trim().toLowerCase().replace(/\s+/g, " ");
  await db.insert(schema.queries).values({
    id,
    prompt,
    normalizedPrompt: normalized,
    promptHash: hashString(normalized),
    intent,
    partial: false,
    sourcesUsed: "[]",
    warnings: "[]",
    createdAt: nowIso(),
  });
  return id;
}

export async function persistLeads(queryId: string, leads: Lead[]): Promise<void> {
  if (leads.length === 0) return;
  for (const l of leads) {
    await db
      .insert(schema.leads)
      .values({
        id: l.id,
        queryId,
        name: l.name,
        type: l.type,
        email: l.email,
        emailConfidence: l.email_confidence,
        phone: l.phone,
        website: l.website,
        social: JSON.stringify(l.social),
        location: l.location ? JSON.stringify(l.location) : null,
        category: l.category,
        source: l.source,
        fetchedAt: l.fetched_at,
        score: l.score,
        notes: l.notes ?? null,
      })
      .onConflictDoNothing();
  }
}

export async function loadLeadsForQuery(queryId: string): Promise<Lead[]> {
  const rows = await db.select().from(schema.leads).where(eq(schema.leads.queryId, queryId));
  return rows.map(rowToLead);
}

export async function loadAllLeads(limit = 1000): Promise<Lead[]> {
  const rows = await db.select().from(schema.leads).limit(limit);
  return rows.map(rowToLead);
}

function rowToLead(r: typeof schema.leads.$inferSelect): Lead {
  return {
    id: r.id,
    name: r.name,
    type: r.type as Lead["type"],
    email: r.email,
    email_confidence: r.emailConfidence,
    phone: r.phone,
    website: r.website,
    social: safeParse<Lead["social"]>(r.social, []),
    location: r.location ? safeParse<Lead["location"]>(r.location, null) : null,
    category: r.category,
    source: r.source,
    fetched_at: r.fetchedAt,
    score: r.score,
    notes: r.notes ?? undefined,
  };
}

function safeParse<T>(s: string, fallback: T): T {
  try {
    return JSON.parse(s) as T;
  } catch {
    return fallback;
  }
}
