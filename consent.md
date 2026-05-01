# Before you run Satonic

Read this once. It is shown the first time the app starts.

## What Satonic does

- Searches **public** data sources (Google Maps, YouTube Data API, public web).
- Stores leads **only on your machine** in a local SQLite file.
- Uses **free LLM provider tiers** (NVIDIA NIM, Groq, Cerebras, OpenRouter) when keys are present.

## What Satonic does NOT do

- Scrape LinkedIn, Facebook, walled-garden Instagram/TikTok content.
- Send any email, SMS, or message on your behalf.
- Share your data with anyone. Telemetry is **off by default**.

## Your responsibilities

Outreach you build on top of these leads is **your** legal responsibility:

- **CAN-SPAM (US):** real physical address + working unsubscribe in every commercial message.
- **GDPR (EU):** document your legitimate-interest assessment for cold B2B; honor erasure requests.
- **CASL (Canada):** consent rules are stricter than email-marketing folklore — read the actual statute.
- **TCPA (US):** SMS/voice has separate, stricter consent requirements than email.

This is not legal advice.

## License

MIT. See [LICENSE](LICENSE). Contributors and maintainers provide Satonic AS IS.

By running Satonic, you agree that you understand and accept the responsibilities above.
