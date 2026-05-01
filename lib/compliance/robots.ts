import "server-only";
import robotsParser from "robots-parser";
import blocked from "./blocked-sources.json";

const USER_AGENT = "SatonicBot/0.1 (+https://github.com/satonic-dev/satonic)";
const robotsCache = new Map<string, ReturnType<typeof robotsParser>>();

export function isBlockedSource(url: string): boolean {
  const u = url.toLowerCase();
  return blocked.domains.some((d) => u.includes(d));
}

export async function isAllowedByRobots(url: string): Promise<boolean> {
  if (isBlockedSource(url)) return false;
  try {
    const parsed = new URL(url);
    const origin = `${parsed.protocol}//${parsed.host}`;
    let robots = robotsCache.get(origin);
    if (!robots) {
      const res = await fetch(`${origin}/robots.txt`, {
        headers: { "user-agent": USER_AGENT },
        signal: AbortSignal.timeout(5000),
      }).catch(() => null);
      const txt = res && res.ok ? await res.text() : "";
      robots = robotsParser(`${origin}/robots.txt`, txt);
      robotsCache.set(origin, robots);
    }
    return robots.isAllowed(url, USER_AGENT) ?? true;
  } catch {
    return true;
  }
}

export function userAgent(): string {
  return USER_AGENT;
}
