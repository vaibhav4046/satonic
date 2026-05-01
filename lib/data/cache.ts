import "server-only";
import { db, schema } from "./db";
import { eq } from "drizzle-orm";
import { hashString, nowIso } from "@/lib/utils";

export function cacheKey(prompt: string): string {
  const normalized = prompt.trim().toLowerCase().replace(/\s+/g, " ");
  return hashString(normalized);
}

export async function readCache<T>(key: string): Promise<T | null> {
  const rows = await db.select().from(schema.cache).where(eq(schema.cache.hash, key)).limit(1);
  const row = rows[0];
  if (!row) return null;
  const ageSec = (Date.now() - new Date(row.createdAt).getTime()) / 1000;
  if (ageSec > row.ttlSeconds) {
    await db.delete(schema.cache).where(eq(schema.cache.hash, key));
    return null;
  }
  try {
    return JSON.parse(row.result) as T;
  } catch {
    return null;
  }
}

export async function writeCache<T>(key: string, value: T, ttlSeconds = 86400): Promise<void> {
  const payload = JSON.stringify(value);
  await db
    .insert(schema.cache)
    .values({ hash: key, result: payload, createdAt: nowIso(), ttlSeconds })
    .onConflictDoUpdate({
      target: schema.cache.hash,
      set: { result: payload, createdAt: nowIso(), ttlSeconds },
    });
}

export async function clearCache(): Promise<void> {
  await db.delete(schema.cache);
}
