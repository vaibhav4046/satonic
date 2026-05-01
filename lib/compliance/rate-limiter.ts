import "server-only";
import { isAllowedByRobots, userAgent } from "./robots";

type Bucket = { tokens: number; last: number };
const buckets = new Map<string, Bucket>();
const DEFAULT_RPS = 1;
const DEFAULT_BURST = 3;

function bucketFor(domain: string): Bucket {
  let b = buckets.get(domain);
  if (!b) {
    b = { tokens: DEFAULT_BURST, last: Date.now() };
    buckets.set(domain, b);
  }
  return b;
}

async function acquire(domain: string, rps: number = DEFAULT_RPS): Promise<void> {
  const b = bucketFor(domain);
  for (;;) {
    const now = Date.now();
    const elapsedSec = (now - b.last) / 1000;
    b.tokens = Math.min(DEFAULT_BURST, b.tokens + elapsedSec * rps);
    b.last = now;
    if (b.tokens >= 1) {
      b.tokens -= 1;
      return;
    }
    const waitMs = Math.max(50, ((1 - b.tokens) / rps) * 1000);
    await new Promise((r) => setTimeout(r, waitMs));
  }
}

export class BlockedByPolicyError extends Error {
  constructor(public url: string, public reason: string) {
    super(`Blocked: ${url} (${reason})`);
  }
}

export async function safeFetch(
  url: string,
  init: RequestInit = {},
  opts: { rps?: number; timeoutMs?: number; respectRobots?: boolean } = {}
): Promise<Response> {
  const { rps = DEFAULT_RPS, timeoutMs = 15000, respectRobots = true } = opts;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`Invalid URL: ${url}`);
  }
  const domain = parsed.host;

  if (respectRobots) {
    const allowed = await isAllowedByRobots(url);
    if (!allowed) throw new BlockedByPolicyError(url, "robots.txt or blocked-sources");
  }

  await acquire(domain, rps);

  const headers = new Headers(init.headers);
  if (!headers.has("user-agent")) headers.set("user-agent", userAgent());
  if (!headers.has("accept-language")) headers.set("accept-language", "en-US,en;q=0.9");

  const ctrl = AbortSignal.timeout(timeoutMs);
  const signal = init.signal ? mergeSignals([init.signal, ctrl]) : ctrl;

  return fetch(url, { ...init, headers, signal });
}

function mergeSignals(signals: AbortSignal[]): AbortSignal {
  const ctrl = new AbortController();
  for (const s of signals) {
    if (s.aborted) {
      ctrl.abort(s.reason);
      break;
    }
    s.addEventListener("abort", () => ctrl.abort(s.reason), { once: true });
  }
  return ctrl.signal;
}
