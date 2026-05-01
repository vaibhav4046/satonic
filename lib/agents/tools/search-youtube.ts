import "server-only";
import { tool } from "ai";
import { SearchYouTubeInput, SearchYouTubeOutput } from "@/lib/agents/schemas";
import { hashString, nowIso, clampScore } from "@/lib/utils";
import type { Lead } from "@/lib/types";
import { safeFetch } from "@/lib/compliance/rate-limiter";

type SearchResp = {
  items?: Array<{ snippet?: { channelId?: string; channelTitle?: string } }>;
};

type ChannelResp = {
  items?: Array<{
    id?: string;
    snippet?: {
      title?: string;
      description?: string;
      country?: string;
      customUrl?: string;
      thumbnails?: { default?: { url?: string } };
    };
    statistics?: { subscriberCount?: string; videoCount?: string };
    brandingSettings?: { channel?: { country?: string } };
  }>;
};

function extractEmail(text: string | undefined | null): string | null {
  if (!text) return null;
  const m = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return m?.[0] ?? null;
}

function extractWebsite(text: string | undefined | null): string | null {
  if (!text) return null;
  const m = text.match(/https?:\/\/[^\s<>"]+/);
  if (!m) return null;
  const url = m[0].replace(/[.,)]+$/, "");
  if (/youtube\.com|youtu\.be|instagram\.com|tiktok\.com|twitter\.com|x\.com/.test(url)) return null;
  return url;
}

export const searchYouTubeTool = tool({
  description:
    "Find YouTube creators by topic, niche, or keyword. Returns channel name, subscriber count, public email if listed, website, country. Filter by min/max subscribers.",
  parameters: SearchYouTubeInput,
  execute: async ({ query, min_subs, max_subs, limit }) => {
    const key = process.env.YOUTUBE_API_KEY;
    if (!key) {
      return SearchYouTubeOutput.parse({
        leads: [],
        source: "youtube",
        warnings: ["YOUTUBE_API_KEY not set — add it for influencer search."],
      });
    }
    const search = new URL("https://www.googleapis.com/youtube/v3/search");
    search.searchParams.set("part", "snippet");
    search.searchParams.set("type", "channel");
    search.searchParams.set("q", query);
    search.searchParams.set("maxResults", String(Math.min(limit, 50)));
    search.searchParams.set("key", key);
    const sRes = await safeFetch(search.toString(), {}, { rps: 5, respectRobots: false });
    if (!sRes.ok) {
      return SearchYouTubeOutput.parse({
        leads: [],
        source: "youtube",
        warnings: [`YouTube search ${sRes.status}`],
      });
    }
    const sJson = (await sRes.json()) as SearchResp;
    const channelIds = (sJson.items ?? [])
      .map((i) => i.snippet?.channelId)
      .filter((x): x is string => Boolean(x));
    if (channelIds.length === 0) {
      return SearchYouTubeOutput.parse({
        leads: [],
        source: "youtube",
        warnings: ["No channels matched."],
      });
    }
    const ch = new URL("https://www.googleapis.com/youtube/v3/channels");
    ch.searchParams.set("part", "snippet,statistics,brandingSettings");
    ch.searchParams.set("id", channelIds.join(","));
    ch.searchParams.set("key", key);
    const cRes = await safeFetch(ch.toString(), {}, { rps: 5, respectRobots: false });
    if (!cRes.ok) {
      return SearchYouTubeOutput.parse({
        leads: [],
        source: "youtube",
        warnings: [`YouTube channels ${cRes.status}`],
      });
    }
    const cJson = (await cRes.json()) as ChannelResp;
    const leads: Lead[] = [];
    for (const c of cJson.items ?? []) {
      const subs = c.statistics?.subscriberCount ? Number(c.statistics.subscriberCount) : 0;
      if (min_subs !== null && subs < min_subs) continue;
      if (max_subs !== null && subs > max_subs) continue;
      const desc = c.snippet?.description ?? "";
      const email = extractEmail(desc);
      const website = extractWebsite(desc);
      const handle = c.snippet?.customUrl?.replace(/^@/, "") ?? c.id ?? "";
      const channelUrl = c.id ? `https://www.youtube.com/channel/${c.id}` : null;
      const id = hashString(`yt:${c.id ?? handle}`);
      let score = 50;
      if (subs >= 10000) score += 10;
      if (subs >= 100000) score += 10;
      if (email) score += 20;
      if (website) score += 10;
      leads.push({
        id,
        name: c.snippet?.title ?? handle,
        type: "creator",
        email,
        email_confidence: email ? 90 : 0,
        phone: null,
        website,
        social: channelUrl
          ? [{ platform: "youtube", url: channelUrl, followers: subs, handle }]
          : [],
        location: c.brandingSettings?.channel?.country
          ? { country: c.brandingSettings.channel.country }
          : null,
        category: null,
        source: "youtube",
        fetched_at: nowIso(),
        score: clampScore(score),
        notes: desc.slice(0, 200),
      });
    }
    return SearchYouTubeOutput.parse({ leads, source: "youtube", warnings: [] });
  },
});
