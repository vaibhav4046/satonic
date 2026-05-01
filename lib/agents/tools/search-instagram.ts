import "server-only";
import { tool } from "ai";
import { SearchInstagramInput, SearchInstagramOutput } from "@/lib/agents/schemas";
import { hashString, nowIso } from "@/lib/utils";

export const searchInstagramTool = tool({
  description:
    "DISABLED in MVP: Instagram public profile lookup. ToS forbids automated scraping; returns a warning. Use Instagram Basic Display API + user OAuth in Phase 2.",
  parameters: SearchInstagramInput,
  execute: async ({ username }) => {
    return SearchInstagramOutput.parse({
      leads: [
        {
          id: hashString(`ig-stub:${username}`),
          name: username,
          type: "creator",
          email: null,
          email_confidence: 0,
          phone: null,
          website: null,
          social: [{ platform: "instagram", url: `https://instagram.com/${username}`, handle: username }],
          location: null,
          category: null,
          source: "instagram_public",
          fetched_at: nowIso(),
          score: 20,
          notes: "Stub only — Instagram scraping disabled by policy.",
        },
      ],
      source: "instagram_public",
      warnings: ["Instagram scraping is disabled. Use the official Basic Display API in Phase 2."],
    });
  },
});
