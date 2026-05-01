export const ENRICHMENT_PROMPT = `You are enriching a single lead. Given the existing fields, return ONLY the fields you can improve with high confidence. Output JSON. Never invent data.

Input shape:
{ name, website, phone, email, social[], category, location }

Output shape (omit any field you cannot improve):
{
  "category": "more specific category if obvious from context",
  "location": { "city", "country" },
  "social": [{"platform","url"}],
  "notes": "1-line summary if useful"
}
`;
