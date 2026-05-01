# Contributing to Satonic

Thanks for your interest. Satonic stays sharp because the community pushes it forward.

## Quick rules

1. **Open an issue first** for anything bigger than a typo or a tiny bug.
2. **One PR = one concern.** Don't bundle a refactor with a feature.
3. **Tests must pass.** `pnpm test` and `pnpm typecheck`.
4. **No new dependency over 5MB** without discussion.
5. **No LinkedIn scraping.** Ever.

## Setup

```bash
git clone https://github.com/satonic-dev/satonic
cd satonic
pnpm install
cp .env.example .env
pnpm dev
```

## Adding a data source

Each tool is a single file in `lib/agents/tools/`. See [docs/contributing-tools.md](docs/contributing-tools.md) for the full pattern. Minimum requirements:

- Zod schema for input + output
- Goes through `lib/compliance/rate-limiter.ts` for any HTTP call
- Returns leads in the canonical `Lead` shape
- Source identifier added to `lib/types.ts` if new
- Test fixture in `tests/fixtures/`

## Commit style

Conventional Commits.

```
feat(tool): add Bing Maps lead source
fix(router): retry on 502 from Groq
chore: bump deps
```

## Issue templates

Use the templates in `.github/ISSUE_TEMPLATE/`. "good first issue" labels are exactly that — start there.
