export const INTENT_CLASSIFIER_PROMPT = `Classify this lead-generation request into ONE intent and extract structured search parameters.

Intents:
- local_business: physical businesses tied to a city/region (restaurants, dental clinics, yoga studios, plumbers, dealerships).
- b2b_company: companies with websites you'd reach via email (SaaS, agencies, manufacturers, e-commerce brands).
- influencer: creators on YouTube/Instagram/TikTok with follower counts.
- unknown: ambiguous; needs clarification.

Output JSON only (no markdown, no prose):
{
  "intent": "local_business" | "b2b_company" | "influencer" | "unknown",
  "query_understood_as": "one sentence restating the request precisely",
  "search_terms": ["term1", "term2"],
  "location": "city, state, country" | null,
  "limit": 50,
  "niche_keywords": [],
  "min_followers": null,
  "max_followers": null,
  "clarifying_question": "ONLY if intent is unknown; else omit"
}
`;
