# Adding a new data source

A "data source" in Satonic is a single file in `lib/agents/tools/`. The agent picks it automatically based on the system prompt — no other wiring required other than registering it in `lib/agents/tools/index.ts`.

## The 5-minute pattern

1. Add zod schemas to `lib/agents/schemas.ts`:

```ts
export const SearchBingMapsInput = z.object({
  query: z.string().min(2),
  location: z.string().nullable(),
  limit: z.number().int().min(1).max(50).default(25),
});
export const SearchBingMapsOutput = z.object({
  leads: z.array(LeadSchema),
  source: z.literal("bing_maps"),
  warnings: z.array(z.string()).default([]),
});
```

2. Create `lib/agents/tools/search-bing-maps.ts`:

```ts
import "server-only";
import { tool } from "ai";
import { SearchBingMapsInput, SearchBingMapsOutput } from "@/lib/agents/schemas";
import { safeFetch } from "@/lib/compliance/rate-limiter";
import { hashString, nowIso, clampScore } from "@/lib/utils";
import type { Lead } from "@/lib/types";

export const searchBingMapsTool = tool({
  description: "Find local businesses on Bing Maps when Google Places is rate-limited.",
  parameters: SearchBingMapsInput,
  execute: async ({ query, location, limit }) => {
    // 1. Build the request URL
    // 2. Call safeFetch (NEVER raw fetch — it bypasses robots/rate limit)
    // 3. Parse → map to Lead[]
    // 4. Return SearchBingMapsOutput.parse(...)
  },
});
```

3. Register in `lib/agents/tools/index.ts`:

```ts
import { searchBingMapsTool } from "./search-bing-maps";

export const allTools = {
  ...
  search_bing_maps: searchBingMapsTool,
};
```

4. Add a test fixture in `tests/fixtures/bing-coffee.json` and a quick assertion in `tests/tools.spec.ts`.

5. Update the system prompt in `lib/llm/prompts/system.ts` if the new tool covers a case the existing tools don't.

## Rules

- **Never raw `fetch`** — always `safeFetch` so robots.txt + rate limiting kick in.
- **Validate inputs and outputs with zod.** No exceptions.
- **Never invent contact details.** If a field can't be sourced, leave it null.
- **Score honestly.** A guess gets 30. A verified email + phone gets 90.
- **Source must be unique** — pick a snake_case identifier no other tool uses.

## Good first tools to add

- `search_bing_maps` — fallback for Google Places rate limits
- `search_yelp` — public Yelp business pages
- `search_crunchbase_public` — Crunchbase profile pages (public part only)
- `search_tiktok_creators` — only via official TikTok for Developers API
- `search_github_orgs` — for B2B dev-tool prospects
