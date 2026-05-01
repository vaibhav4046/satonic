import "server-only";
import { tool } from "ai";
import dns from "node:dns/promises";
import { VerifyMxInput, VerifyMxOutput } from "@/lib/agents/schemas";

const mxCache = new Map<string, { valid: boolean; records: string[]; ts: number }>();
const TTL_MS = 60 * 60 * 1000;

export async function verifyMxRaw(domain: string): Promise<{ valid: boolean; records: string[] }> {
  const d = domain.toLowerCase().replace(/^www\./, "");
  const cached = mxCache.get(d);
  if (cached && Date.now() - cached.ts < TTL_MS) return { valid: cached.valid, records: cached.records };
  try {
    const records = await dns.resolveMx(d);
    const sorted = records.sort((a, b) => a.priority - b.priority).map((r) => r.exchange);
    const valid = sorted.length > 0;
    mxCache.set(d, { valid, records: sorted, ts: Date.now() });
    return { valid, records: sorted };
  } catch {
    mxCache.set(d, { valid: false, records: [], ts: Date.now() });
    return { valid: false, records: [] };
  }
}

export const verifyMxTool = tool({
  description: "Check if a domain has valid MX records (i.e. can receive email).",
  parameters: VerifyMxInput,
  execute: async ({ domain }) => {
    const r = await verifyMxRaw(domain);
    return VerifyMxOutput.parse(r);
  },
});
