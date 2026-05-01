# Architecture

## High-level flow

```
Browser  ─► useChat (Vercel AI SDK)
         ─► POST /api/chat with messages[]
              ─► orchestrator.runAgent
                   ─► streamText(model, system, tools)
                        ─► tool: search_maps   ─► Google Places API  ─► safeFetch
                        ─► tool: search_web    ─► DuckDuckGo + page  ─► safeFetch
                        ─► tool: search_youtube─► YouTube Data API   ─► safeFetch
                        ─► tool: enrich_email  ─► verify_mx + patterns
                        ─► tool: enrich_phone  ─► libphonenumber-js
              ─► toDataStreamResponse() → SSE
Browser  ◄── stream of tool-invocation parts
         ─► useEffect parses tool results
              ─► useLeadStore.addLeads (zustand + persist)
              ─► ResultsPanel re-renders live
```

## File map

```
app/
  layout.tsx          theme + toaster
  page.tsx            ChatSurface
  api/
    chat/route.ts     POST → streamText → SSE
    export/route.ts   POST leads → CSV download
    health/route.ts   GET → providers + flags
    suppression/route.ts  GET/POST suppression list

components/
  chat/
    chat-surface.tsx  glue: useChat ↔ store
    chat-panel.tsx    left column: messages + input
    message.tsx       per-message renderer (text + tool blocks)
    streaming-indicator.tsx
  results/
    results-panel.tsx right column wrapper
    leads-table.tsx   sortable, selectable table
    export-bar.tsx    filter + sort + copy + CSV
  ui/                 shadcn primitives

lib/
  llm/
    router.ts         availableProviders + withFallback
    providers/        nvidia-nim · groq · cerebras · openrouter
    prompts/          system · intent-classifier · enrichment
  agents/
    orchestrator.ts   streamText + tools + maxSteps
    tools/            7 tools, all zod-validated
    schemas.ts        zod input/output schemas
    persist.ts        SQLite write-through
  data/
    schema.ts         drizzle table defs
    db.ts             better-sqlite3 + bootstrap
    cache.ts          24h TTL, prompt-hash key
  compliance/
    blocked-sources.json
    robots.ts         robots.txt cache + parser
    rate-limiter.ts   safeFetch — token bucket + robots
    suppression.ts    CSV ingest, filter helper
  utils/
    csv.ts            leadsToCsv
    email-patterns.ts pattern generator
    phone.ts          E.164 normalizer
  types.ts            Lead + zod schemas
  utils.ts            cn · hashString · normalizeDomain
  store.ts            zustand persisted store
```

## Streaming + state sync

Vercel AI SDK emits typed parts on the stream:
- `text-delta` — assistant prose
- `tool-call` — args sent to a tool
- `tool-result` — tool's return value

`ChatSurface` watches `messages` and runs every new tool result through `LeadSchema.safeParse`. Valid leads are pushed into `useLeadStore`, which dedupes by `id` (a hash of `domain | phone | name`). The persisted slice survives reloads via `localStorage`.

## Why no LangChain

Vercel AI SDK's `tool()` + `streamText({ tools })` is enough. LangChain's abstractions add bundle weight and a steeper debug story for an MVP this small.

## Why Neon Postgres

HTTP-only driver (`@neondatabase/serverless` + `drizzle-orm/neon-http`) works on Vercel's serverless functions where TCP-keepalive Postgres clients fail. Free tier: 0.5 GB, dev branches, autosuspend. Schema is in `lib/data/schema.ts` (drizzle pg-core); push with `pnpm db:push`.
