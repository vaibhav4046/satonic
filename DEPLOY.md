# Deploy Satonic to Vercel

End-to-end, zero-cost path. ~10 minutes.

## Prereqs

- Node 20+, pnpm 9+
- GitHub account
- 5 min to make 2 free accounts (Neon + NVIDIA)

## Step 1 — Free Neon Postgres (2 min)

1. https://console.neon.tech
2. Sign up with GitHub (no card)
3. **Create project** → name it `satonic`, region close to you
4. From the dashboard, click **Connection Details** → copy the connection string

Format: `postgres://USER:PASS@ep-xxx-xxx.region.aws.neon.tech/satonic?sslmode=require`

Save it — you'll paste it twice.

## Step 2 — Free NVIDIA NIM key (1 min)

1. https://build.nvidia.com
2. Sign up
3. Pick a model — recommend `meta/llama-3.3-70b-instruct`
4. Click **Get API key** → copy

Save it.

## Step 3 — Push schema to Neon (30 sec)

From the `satonic/` directory:

```bash
pnpm install
DATABASE_URL="<neon-connection-string>" pnpm db:push
```

Drizzle creates 5 tables. Verify in Neon dashboard → Tables.

## Step 4 — Push code to GitHub (1 min)

```bash
cd satonic
git init
git add -A
git commit -m "feat: satonic v0.1.0 mvp"
gh repo create satonic --public --source=. --push
```

(Don't have `gh`? Make a repo at github.com/new manually, then:
```bash
git remote add origin git@github.com:YOUR_USER/satonic.git
git push -u origin main
```
)

## Step 5 — Deploy to Vercel (3 min)

```bash
npm i -g vercel
vercel login                         # browser auth
vercel link                          # select org, name=satonic
vercel env add DATABASE_URL production
# paste Neon string when prompted

vercel env add NVIDIA_NIM_API_KEY production
# paste NVIDIA key

vercel --prod
```

Vercel prints a URL like `https://satonic-abcdef.vercel.app`. **That's your deployed link.**

## Step 6 — Smoke test (30 sec)

1. Open the URL
2. Click an example prompt or type: `find 10 coffee shops in Boston`
3. Watch tool calls stream on the left, leads populate on the right
4. Click **Export CSV**

If `find 10 coffee shops` returns 0 leads: you skipped Google Places. Add it (optional but recommended):

```bash
vercel env add GOOGLE_PLACES_API_KEY production
vercel --prod
```

(Same for `YOUTUBE_API_KEY` for influencer queries.)

## Troubleshooting

| Symptom | Fix |
|---|---|
| 503 "All free LLM providers exhausted" | Add `NVIDIA_NIM_API_KEY` env var, redeploy |
| Empty results, no errors | Add `GOOGLE_PLACES_API_KEY` (local biz) or `YOUTUBE_API_KEY` (creators) |
| `DATABASE_URL is required` | Env var didn't apply — check `vercel env ls`, redeploy |
| Function timeout at 60s | Already raised to 120s in vercel.json. Lower the result limit in the prompt. |
| Tables don't exist | Run `pnpm db:push` with Neon URL again |

## Custom domain

```bash
vercel domains add satonic.app       # buy first if needed
vercel alias set satonic-abcdef.vercel.app satonic.app
```

## What's free vs paid

- Vercel hobby: free, 100 GB bandwidth/mo, 100h build time/mo
- Neon free: 0.5 GB storage, ~190 compute-hours/mo
- NVIDIA NIM free: 1k req/min limit, plenty for personal use
- Google Places: $200/mo Cloud credit (≈40k Place searches free)
- YouTube Data: 10k units/day free (each search = 100 units → 100 searches/day)

For >5k leads/day, swap to a paid Neon plan ($19/mo) and you're still well under Apollo cost.
