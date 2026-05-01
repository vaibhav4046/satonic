# Satonic — the open-source lead-gen chatbot

> Type one sentence. Get real leads. Free forever.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/satonic-dev/satonic&env=DATABASE_URL,NVIDIA_NIM_API_KEY&envDescription=DATABASE_URL%20%3D%20Neon%20Postgres%20conn%20string%20%28free%20at%20console.neon.tech%29.%20NVIDIA_NIM_API_KEY%20%3D%20free%20at%20build.nvidia.com)
![License: MIT](https://img.shields.io/badge/license-MIT-blue)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6)

## What it does

- **"Find me 50 dental clinics in Miami with phone numbers"** → CSV in 30 seconds.
- **"Find fitness creators on YouTube with 100k–500k subs"** → table with channel, subs, email, website.
- **"Find SaaS companies in Berlin with careers pages"** → companies + decision-maker email pattern.

Streaming chat on the left, live results table on the right. Sort, filter, select, copy or export to CSV.

## Why

Apollo + ZoomInfo + Clay + Instantly = ~$3,600/year. Satonic is **free**, **open source**, and runs on Vercel + Neon free tiers. No credit-burn pricing. No 15-minute Clay workflows. No LinkedIn scraping.

## Deploy to Vercel (recommended, ~5 min)

### 1. Get a free Neon Postgres database

- Sign up: https://console.neon.tech (no card)
- Create project → copy connection string (looks like `postgres://user:pass@ep-xxx.region.neon.tech/dbname?sslmode=require`)

### 2. Get a free NVIDIA NIM API key

- Sign up: https://build.nvidia.com (60 sec)
- Pick `meta/llama-3.3-70b-instruct` → "Get API key" → copy

### 3. Push the repo + deploy

```bash
cd satonic
git init
git add -A
git commit -m "feat: satonic v0.1.0 mvp"
gh repo create satonic --public --source=. --push    # or push to existing repo

# install Vercel CLI if needed
npm i -g vercel

# link + deploy
vercel link
vercel env add DATABASE_URL production         # paste Neon string
vercel env add NVIDIA_NIM_API_KEY production   # paste NVIDIA key
vercel --prod
```

### 4. Push schema to Neon

```bash
DATABASE_URL="<your-neon-url>" pnpm db:push
```

Open the URL Vercel printed. Done.

## Local dev

```bash
git clone https://github.com/satonic-dev/satonic
cd satonic
cp .env.example .env       # add DATABASE_URL + NVIDIA_NIM_API_KEY
pnpm install
pnpm db:push               # one-time schema push
pnpm dev
```

http://localhost:3000.

## Free LLM provider stack

Satonic falls through providers automatically. Set any one (or several) in `.env`:

| Provider | Free tier | Sign-up |
|---|---|---|
| **NVIDIA NIM** | 1,000 RPM, llama-3.3-70b | https://build.nvidia.com |
| **Groq** | ~14k req/day, fastest | https://console.groq.com |
| **Cerebras** | ~1k req/day, llama-3.3-70b | https://cloud.cerebras.ai |
| **OpenRouter** | free models available | https://openrouter.ai |

## Free data sources

- **Google Maps Places** — local businesses (free $200/mo Google Cloud credit)
- **DuckDuckGo + page-fetch** — B2B companies, agencies, SaaS
- **YouTube Data API v3** — creators (10k units/day free)
- **MX-record check + email-pattern guessing** — work email enrichment, no paid API
- **libphonenumber-js** — phone normalization

## Compliance — built in from day 1

- Respects `robots.txt` on every fetch
- Per-domain rate limits (default 1 req/sec)
- Hard-blocked sources: LinkedIn, Facebook, Instagram posts, TikTok profiles, X/Twitter
- Suppression list — upload a CSV of opt-outs, never returned
- Public data only. **You** are responsible for following GDPR / CAN-SPAM. See [docs/compliance.md](docs/compliance.md).

## Architecture

```
Chat (left)  →  /api/chat  →  Vercel AI SDK streamText
                                        ↓
                                LLM router (NVIDIA → Groq → Cerebras → OR)
                                        ↓
                                tools: maps · web · youtube · enrich-email · enrich-phone · verify-mx
                                        ↓
                                rate-limited safeFetch + robots.txt
                                        ↓
Results (right, zustand store)  ←  streamed tool results
                                        ↓
                                CSV export · clipboard · sort · filter · select
                                        ↓
                                Neon Postgres (drizzle/neon-http)
```

See [docs/architecture.md](docs/architecture.md).

## Adding a new data source

A tool is a single file in `lib/agents/tools/`. See [docs/contributing-tools.md](docs/contributing-tools.md).

## Roadmap

| Phase | What |
|---|---|
| **0.1 (now)** | Chat + 3 search modes + enrichment + CSV export + Neon |
| **0.2** | Suppression list UI, Bing Maps tool, page-2 pagination |
| **0.3** | Conversational refinement ("drop California, add Texas") |
| **1.0** | Multi-user accounts (Clerk free tier) |
| **1.1** | Outreach: send via Gmail/Outlook OAuth |
| **2.0** | Hosted SaaS — free 100/mo, $19/mo for 10k |

## License

MIT. See [LICENSE](LICENSE).
