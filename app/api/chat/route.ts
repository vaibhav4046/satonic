import { NextRequest } from "next/server";
import type { CoreMessage } from "ai";
import { runAgent } from "@/lib/agents/orchestrator";
import { AllProvidersExhaustedError } from "@/lib/llm/router";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  let body: { messages?: CoreMessage[] };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }
  const messages = body.messages ?? [];
  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: "messages required" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  try {
    const result = runAgent({ messages });
    return result.toDataStreamResponse({
      sendReasoning: false,
      getErrorMessage: (e) => {
        if (e instanceof AllProvidersExhaustedError) return e.message;
        return e instanceof Error ? e.message : "Unknown error";
      },
    });
  } catch (e) {
    if (e instanceof AllProvidersExhaustedError) {
      return new Response(JSON.stringify({ error: e.message, code: "no_providers" }), {
        status: 503,
        headers: { "content-type": "application/json" },
      });
    }
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}
