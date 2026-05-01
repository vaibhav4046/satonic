import { availableProviders } from "@/lib/llm/router";

export const runtime = "nodejs";

export async function GET() {
  const providers = availableProviders().map((p) => p.name);
  return Response.json({
    ok: true,
    version: "0.1.0",
    providers,
    googlePlaces: Boolean(process.env.GOOGLE_PLACES_API_KEY),
    youtube: Boolean(process.env.YOUTUBE_API_KEY),
  });
}
