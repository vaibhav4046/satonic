import { NextRequest } from "next/server";
import { LeadSchema, type Lead } from "@/lib/types";
import { leadsToCsv, csvFilename } from "@/lib/utils/csv";
import { z } from "zod";

export const runtime = "nodejs";

const Body = z.object({ leads: z.array(LeadSchema) });

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }
  const parsed = Body.safeParse(body);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: parsed.error.flatten() }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }
  const csv = leadsToCsv(parsed.data.leads as Lead[]);
  const filename = csvFilename();
  return new Response(csv, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${filename}"`,
      "cache-control": "no-store",
    },
  });
}
