import "server-only";
import { tool } from "ai";
import { SearchMapsInput, SearchMapsOutput } from "@/lib/agents/schemas";
import { hashString, nowIso, clampScore } from "@/lib/utils";
import type { Lead } from "@/lib/types";
import { safeFetch } from "@/lib/compliance/rate-limiter";
import { normalizePhone } from "@/lib/utils/phone";

type PlacesNew = {
  places?: Array<{
    id?: string;
    displayName?: { text?: string };
    formattedAddress?: string;
    nationalPhoneNumber?: string;
    internationalPhoneNumber?: string;
    websiteUri?: string;
    primaryType?: string;
    types?: string[];
    location?: { latitude?: number; longitude?: number };
    addressComponents?: Array<{ longText?: string; types?: string[] }>;
  }>;
};

async function placesApi(query: string, location: string | null, limit: number): Promise<{ leads: Lead[]; warnings: string[] }> {
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) {
    return {
      leads: [],
      warnings: ["GOOGLE_PLACES_API_KEY not set — set it for richer Maps results."],
    };
  }
  const textQuery = location ? `${query} in ${location}` : query;
  const fieldMask = [
    "places.id",
    "places.displayName",
    "places.formattedAddress",
    "places.nationalPhoneNumber",
    "places.internationalPhoneNumber",
    "places.websiteUri",
    "places.primaryType",
    "places.types",
    "places.location",
    "places.addressComponents",
  ].join(",");
  const url = "https://places.googleapis.com/v1/places:searchText";
  const res = await safeFetch(
    url,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-goog-api-key": key,
        "x-goog-fieldmask": fieldMask,
      },
      body: JSON.stringify({ textQuery, pageSize: Math.min(limit, 20) }),
    },
    { rps: 2, respectRobots: false }
  );
  if (!res.ok) {
    return { leads: [], warnings: [`Places API ${res.status}: ${await res.text().catch(() => "")}`] };
  }
  const data = (await res.json()) as PlacesNew;
  const leads: Lead[] = [];
  for (const p of data.places ?? []) {
    const name = p.displayName?.text ?? "";
    if (!name) continue;
    const phoneRaw = p.internationalPhoneNumber ?? p.nationalPhoneNumber ?? null;
    const phone = phoneRaw ? normalizePhone(phoneRaw) : null;
    const website = p.websiteUri ?? null;
    let domain: string | null = null;
    if (website) {
      try {
        domain = new URL(website).hostname.replace(/^www\./, "");
      } catch {
        /* skip */
      }
    }
    const city =
      p.addressComponents?.find((c) => (c.types ?? []).includes("locality"))?.longText ??
      undefined;
    const country =
      p.addressComponents?.find((c) => (c.types ?? []).includes("country"))?.longText ??
      undefined;
    const id = hashString(`${domain ?? ""}|${phone ?? ""}|${name}`);
    let score = 40;
    if (phone) score += 25;
    if (website) score += 25;
    if (city) score += 5;
    leads.push({
      id,
      name,
      type: "business",
      email: null,
      email_confidence: 0,
      phone,
      website,
      social: [],
      location: {
        city,
        country,
        lat: p.location?.latitude,
        lng: p.location?.longitude,
        formatted: p.formattedAddress,
      },
      category: p.primaryType ?? p.types?.[0] ?? null,
      source: "google_places",
      fetched_at: nowIso(),
      score: clampScore(score),
    });
  }
  return { leads, warnings: [] };
}

export const searchMapsTool = tool({
  description:
    "Find local businesses (restaurants, clinics, gyms, shops) by query and location. Returns name, address, phone, website. Use for any local SMB lead-gen.",
  parameters: SearchMapsInput,
  execute: async ({ query, location, limit }) => {
    const { leads, warnings } = await placesApi(query, location, limit);
    return SearchMapsOutput.parse({ leads: leads.slice(0, limit), source: "google_places", warnings });
  },
});
