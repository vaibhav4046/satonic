import { NextRequest } from "next/server";
import { ingestCsv, loadSuppression } from "@/lib/compliance/suppression";

export const runtime = "nodejs";

export async function GET() {
  const set = await loadSuppression();
  return Response.json({ count: set.size, identifiers: Array.from(set).slice(0, 100) });
}

export async function POST(req: NextRequest) {
  const ct = req.headers.get("content-type") ?? "";
  let csv = "";
  if (ct.includes("text/csv") || ct.includes("text/plain")) {
    csv = await req.text();
  } else {
    const body = (await req.json().catch(() => ({}))) as { csv?: string };
    csv = body.csv ?? "";
  }
  if (!csv) {
    return new Response(JSON.stringify({ error: "csv body required" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }
  const { added } = await ingestCsv(csv);
  return Response.json({ added });
}
