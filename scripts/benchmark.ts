import { availableProviders } from "@/lib/llm/router";
import { allTools } from "@/lib/agents/tools";

console.log("Satonic — benchmark");
console.log("=".repeat(40));

const providers = availableProviders();
console.log(`LLM providers configured: ${providers.length}`);
for (const p of providers) console.log(`  - ${p.name}`);
if (providers.length === 0) {
  console.log("  (none — set NVIDIA_NIM_API_KEY or any provider key in .env)");
}

console.log(`\nTools registered: ${Object.keys(allTools).length}`);
for (const name of Object.keys(allTools)) console.log(`  - ${name}`);

console.log(`\nGoogle Places API: ${process.env.GOOGLE_PLACES_API_KEY ? "yes" : "no"}`);
console.log(`YouTube API:       ${process.env.YOUTUBE_API_KEY ? "yes" : "no"}`);
console.log(`Database:          ${process.env.DATABASE_URL ?? "file:./satonic.db"}`);
