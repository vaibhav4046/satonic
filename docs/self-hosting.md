# Self-hosting

Satonic runs on anything that runs Node 20. Database is Neon Postgres (free tier).

## Vercel + Neon (recommended, fully free)

### 1. Neon — free Postgres

- https://console.neon.tech — sign up, no card
- Create project → copy `DATABASE_URL` (looks like `postgres://...neon.tech/...?sslmode=require`)

### 2. LLM provider — pick one (free)

- NVIDIA NIM: https://build.nvidia.com — pick a llama-3.3-70b model, "Get API key"
- Groq: https://console.groq.com — `Personal access tokens`
- Cerebras: https://cloud.cerebras.ai — `API keys`
- OpenRouter: https://openrouter.ai — `Keys`, free models tagged `:free`

### 3. Deploy

```bash
git init && git add -A && git commit -m "satonic v0.1"
gh repo create satonic --public --source=. --push
npm i -g vercel
vercel link
vercel env add DATABASE_URL production
vercel env add NVIDIA_NIM_API_KEY production
vercel --prod
```

### 4. Push schema

```bash
DATABASE_URL="<your-neon-url>" pnpm db:push
```

## Local dev

```bash
git clone https://github.com/satonic-dev/satonic
cd satonic
cp .env.example .env       # fill DATABASE_URL + NVIDIA_NIM_API_KEY
pnpm install
pnpm db:push
pnpm dev
```

Use a Neon dev branch for local — it's free and isolated from prod.

## Self-host on a VPS (Docker)

```bash
git clone https://github.com/satonic-dev/satonic /opt/satonic
cd /opt/satonic
cp .env.example .env       # fill DATABASE_URL (Neon or your own Postgres)
docker compose up -d
```

Reverse-proxy port 3000 with nginx/Caddy.

## API key sign-up links

| Provider | Where |
|---|---|
| Neon Postgres | https://console.neon.tech |
| NVIDIA NIM | https://build.nvidia.com |
| Groq | https://console.groq.com |
| Cerebras | https://cloud.cerebras.ai |
| OpenRouter | https://openrouter.ai |
| Google Places | https://console.cloud.google.com (enable "Places API (New)") |
| YouTube Data v3 | https://console.cloud.google.com (enable "YouTube Data API v3") |

## Resource sizing

Vercel hobby tier: free, ~10 concurrent chats. Neon free tier: 0.5 GB, ~190 compute-hours/mo. Bottleneck is the LLM provider's free-tier rate limit, not the box.
