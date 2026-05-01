import "server-only";
import { tool } from "ai";
import { SearchWebInput, SearchWebOutput } from "@/lib/agents/schemas";
import { hashString, nowIso, clampScore, dedupeBy } from "@/lib/utils";
import type { Lead } from "@/lib/types";
import { safeFetch, BlockedByPolicyError } from "@/lib/compliance/rate-limiter";

const DDG_HTML = "https://html.duckduckgo.com/html/";

function parseDdgResults(html: string): Array<{ title: string; url: string; snippet: string }> {
  const results: Array<{ title: string; url: string; snippet: string }> = [];
  const blocks = html.split(/<div\s+class="result\s+results_links/);
  for (const blk of blocks.slice(1)) {
    const urlMatch = blk.match(/href="([^"]+)"\s+class="result__a"/);
    const titleMatch = blk.match(/class="result__a"[^>]*>([^<]+)<\/a>/);
    const snipMatch = blk.match(/class="result__snippet"[^>]*>([\s\S]*?)<\/a>/);
    if (!urlMatch || !titleMatch) continue;
    const rawUrl = decodeURIComponent(urlMatch[1] ?? "");
    const cleanUrl = rawUrl.replace(/^\/\/duckduckgo\.com\/l\/\?uddg=/, "").replace(/&rut=.*$/, "");
    const finalUrl = cleanUrl.startsWith("http") ? cleanUrl : `https://${cleanUrl}`;
    const title = (titleMatch[1] ?? "").replace(/<[^>]+>/g, "").trim();
    const snippet = (snipMatch?.[1] ?? "").replace(/<[^>]+>/g, "").trim();
    results.push({ title, url: finalUrl, snippet });
  }
  return results;
}

function extractEmails(text: string): string[] {
  const re = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  return Array.from(new Set(text.match(re) ?? [])).filter(
    (e) => !/(@|\.)(sentry|wix|squarespace|gravatar|example|test)\./i.test(e)
  );
}

function extractPhones(text: string): string[] {
  const re = /(?:\+?\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g;
  return Array.from(new Set(text.match(re) ?? []));
}

async function fetchPageContacts(
  url: string
): Promise<{ emails: string[]; phones: string[] }> {
  try {
    const res = await safeFetch(url, {}, { rps: 1, timeoutMs: 8000 });
    if (!res.ok) return { emails: [], phones: [] };
    const txt = await res.text();
    return { emails: extractEmails(txt), phones: extractPhones(txt) };
  } catch (err) {
    if (err instanceof BlockedByPolicyError) return { emails: [], phones: [] };
    return { emails: [], phones: [] };
  }
}

export const searchWebTool = tool({
  description:
    "Search the public web (DuckDuckGo) for B2B companies, agencies, SaaS, e-commerce brands. Visits the top result pages and extracts contact info. Use for any non-local lead.",
  parameters: SearchWebInput,
  execute: async ({ query, limit }) => {
    const warnings: string[] = [];
    const formData = new URLSearchParams({ q: query });
    let html = "";
    try {
      const res = await safeFetch(
        DDG_HTML,
        {
          method: "POST",
          body: formData,
          headers: { "content-type": "application/x-www-form-urlencoded" },
        },
        { rps: 1 }
      );
      if (!res.ok) {
        warnings.push(`DuckDuckGo ${res.status}`);
      } else {
        html = await res.text();
      }
    } catch (e) {
      warnings.push(`DuckDuckGo fetch failed: ${(e as Error).message}`);
    }

    const results = parseDdgResults(html).slice(0, Math.min(limit, 15));
    const leads: Lead[] = [];
    const fetches = results.map(async (r) => {
      const { emails, phones } = await fetchPageContacts(r.url);
      let domain: string | null = null;
      try {
        domain = new URL(r.url).hostname.replace(/^www\./, "");
      } catch {
        /* skip */
      }
      const id = hashString(domain ?? r.url);
      let score = 35;
      if (emails.length > 0) score += 30;
      if (phones.length > 0) score += 20;
      if (domain) score += 10;
      const lead: Lead = {
        id,
        name: r.title.split(" - ")[0]?.split(" | ")[0]?.trim() ?? r.title,
        type: "business",
        email: emails[0] ?? null,
        email_confidence: emails[0] ? 70 : 0,
        phone: phones[0] ?? null,
        website: domain ? `https://${domain}` : r.url,
        social: [],
        location: null,
        category: null,
        source: "web_duckduckgo",
        fetched_at: nowIso(),
        score: clampScore(score),
        notes: r.snippet.slice(0, 140),
      };
      return lead;
    });
    const settled = await Promise.allSettled(fetches);
    for (const s of settled) {
      if (s.status === "fulfilled") leads.push(s.value);
    }
    const deduped = dedupeBy(leads, (l) => {
      try {
        return l.website ? new URL(l.website).hostname.replace(/^www\./, "") : l.name;
      } catch {
        return l.name;
      }
    }).slice(0, limit);
    return SearchWebOutput.parse({ leads: deduped, source: "web_duckduckgo", warnings });
  },
});
