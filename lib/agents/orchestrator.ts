import "server-only";
import { streamText, type CoreMessage } from "ai";
import { allTools } from "./tools";
import { SYSTEM_PROMPT } from "@/lib/llm/prompts/system";
import { availableProviders, AllProvidersExhaustedError } from "@/lib/llm/router";

export type OrchestratorOpts = {
  messages: CoreMessage[];
  maxSteps?: number;
};

export function runAgent(opts: OrchestratorOpts) {
  const providers = availableProviders();
  if (providers.length === 0) {
    throw new AllProvidersExhaustedError([
      { name: "*", error: "No LLM API key set. Add NVIDIA_NIM_API_KEY (or any other) to .env." },
    ]);
  }
  const primary = providers[0]!;

  return streamText({
    model: primary.model,
    system: SYSTEM_PROMPT,
    messages: opts.messages,
    tools: allTools,
    maxSteps: opts.maxSteps ?? 8,
    temperature: 0.2,
    onError: (error) => {
      console.error(`[orchestrator:${primary.name}] error:`, error);
    },
  });
}
