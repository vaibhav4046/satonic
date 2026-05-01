# Compliance

Satonic only uses **public data**, respects `robots.txt`, and ships with a built-in suppression list. **You** are responsible for following GDPR / CAN-SPAM / CASL in your outreach.

## What Satonic does NOT do

- Scrape LinkedIn, Facebook, Instagram posts, TikTok profiles, X/Twitter, or any walled-garden source.
- Submit forms, sign up for accounts, or impersonate users.
- Bypass CAPTCHAs or paywalls.
- Store contact data outside your local SQLite.

## Hard-blocked sources

`lib/compliance/blocked-sources.json` is enforced at the HTTP layer. Any URL matching a blocked domain returns `BlockedByPolicyError` from `safeFetch` — tools can't accidentally route around it.

Default block list:

- linkedin.com
- facebook.com
- instagram.com/p
- tiktok.com/@
- twitter.com / x.com
- messenger.com / whatsapp.com / snapchat.com

## Rate limits

`safeFetch` enforces a token-bucket per domain (default 1 req/sec, burst 3). Tools cannot opt out except for first-party APIs (Google Places, YouTube Data) where the API itself is the rate authority.

## Robots.txt

Every URL goes through `isAllowedByRobots`. The robots file is cached per origin for the process lifetime. Disallowed URLs return `BlockedByPolicyError`.

## Suppression list

Upload a CSV via `POST /api/suppression` (text/csv body or `{"csv": "..."}` JSON):

```
opt-out@example.com
acme.com
+15551234567
```

Email, phone, or domain — auto-detected. `filterSuppressed` is applied after every search before results reach the client.

## Outreach guidance (you, not Satonic)

- **CAN-SPAM (US):** include a real physical address + an unsubscribe link in every commercial email.
- **GDPR (EU):** legitimate-interest is your strongest basis for B2B cold outreach; document your assessment. Honor erasure requests.
- **CASL (Canada):** explicit or implicit consent required. B2B has narrower exemptions than people often assume.
- **TCPA (US):** SMS/voice rules are stricter than email. Don't auto-dial without consent.

This is not legal advice.
