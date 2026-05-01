# Security policy

## Supported versions

`main` only during 0.x. Pin to a tag if you need stability.

## Reporting a vulnerability

Email security@satonic.app with reproduction steps. Do not open a public issue for security bugs. We aim to acknowledge within 48h.

## Threat model

- All keys live in `.env` and never reach the client bundle.
- The chat API only accepts JSON with a `messages` array; no eval, no template injection paths.
- Tool inputs are validated with Zod before any HTTP call.
- All outbound HTTP goes through `safeFetch` which enforces robots.txt + rate limits.
- No user-supplied URLs are followed without going through the same pipeline.
