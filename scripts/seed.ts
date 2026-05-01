import { db, schema } from "@/lib/data/db";
import { hashString, nowIso } from "@/lib/utils";

async function main() {
  await db
    .insert(schema.queries)
    .values({
      id: "seed-query",
      prompt: "[seed] sample coffee shops in Boston",
      normalizedPrompt: "seed sample",
      promptHash: "seed",
      intent: "local_business",
      partial: false,
      sourcesUsed: '["google_places"]',
      warnings: "[]",
      createdAt: nowIso(),
    })
    .onConflictDoNothing();

  const example = {
    id: hashString("seed:bluebird"),
    queryId: "seed-query",
    name: "Bluebird Coffee",
    type: "business",
    email: null,
    emailConfidence: 0,
    phone: "+16175550142",
    website: "https://bluebirdcoffee.example",
    social: "[]",
    location: JSON.stringify({ city: "Boston", country: "US" }),
    category: "cafe",
    source: "google_places",
    fetchedAt: nowIso(),
    score: 70,
    notes: null,
  };
  await db.insert(schema.leads).values(example).onConflictDoNothing();
  console.log("Seeded 1 example lead.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
