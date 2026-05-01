import { pgTable, text, integer, real, boolean, index } from "drizzle-orm/pg-core";

export const queries = pgTable("queries", {
  id: text("id").primaryKey(),
  prompt: text("prompt").notNull(),
  normalizedPrompt: text("normalized_prompt").notNull(),
  promptHash: text("prompt_hash").notNull(),
  intent: text("intent").notNull(),
  partial: boolean("partial").notNull().default(false),
  sourcesUsed: text("sources_used").notNull().default("[]"),
  warnings: text("warnings").notNull().default("[]"),
  createdAt: text("created_at").notNull(),
});

export const leads = pgTable(
  "leads",
  {
    id: text("id").primaryKey(),
    queryId: text("query_id")
      .notNull()
      .references(() => queries.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    type: text("type").notNull(),
    email: text("email"),
    emailConfidence: integer("email_confidence").notNull().default(0),
    phone: text("phone"),
    website: text("website"),
    social: text("social").notNull().default("[]"),
    location: text("location"),
    category: text("category"),
    source: text("source").notNull(),
    fetchedAt: text("fetched_at").notNull(),
    score: real("score").notNull().default(0),
    notes: text("notes"),
  },
  (t) => ({
    queryIdx: index("idx_leads_query").on(t.queryId),
    scoreIdx: index("idx_leads_score").on(t.score),
  })
);

export const cache = pgTable("cache", {
  hash: text("hash").primaryKey(),
  result: text("result").notNull(),
  createdAt: text("created_at").notNull(),
  ttlSeconds: integer("ttl_seconds").notNull().default(86400),
});

export const suppression = pgTable("suppression", {
  identifier: text("identifier").primaryKey(),
  kind: text("kind").notNull(),
  reason: text("reason"),
  createdAt: text("created_at").notNull(),
});

export const rateLimitState = pgTable("rate_limit_state", {
  domain: text("domain").primaryKey(),
  tokens: real("tokens").notNull(),
  lastRefill: text("last_refill").notNull(),
});
