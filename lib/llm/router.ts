import "server-only";
import type { LanguageModelV1 } from "ai";
import { getNvidiaNimModel, NVIDIA_NIM_NAME } from "./providers/nvidia-nim";
import { getGroqModel, GROQ_NAME } from "./providers/groq";
import { getCerebrasModel, CEREBRAS_NAME } from "./providers/cerebras";
import { getOpenRouterModel, OPENROUTER_NAME } from "./providers/openrouter";

export type ProviderEntry = {
  name: string;
  model: LanguageModelV1;
};

export class AllProvidersExhaustedError extends Error {
  constructor(public attempts: { name: string; error: string }[]) {
    super(
      `All free LLM providers exhausted. Add an API key in .env or check your network.\nAttempts:\n${attempts
        .map((a) => `  - ${a.name}: ${a.error}`)
        .join("\n")}`
    );
  }
}

export function availableProviders(): ProviderEntry[] {
  const entries: ProviderEntry[] = [];
  const nvidia = getNvidiaNimModel();
  if (nvidia) entries.push({ name: NVIDIA_NIM_NAME, model: nvidia });
  const groq = getGroqModel();
  if (groq) entries.push({ name: GROQ_NAME, model: groq });
  const cerebras = getCerebrasModel();
  if (cerebras) entries.push({ name: CEREBRAS_NAME, model: cerebras });
  const openrouter = getOpenRouterModel();
  if (openrouter) entries.push({ name: OPENROUTER_NAME, model: openrouter });
  return entries;
}

export function pickPrimary(): ProviderEntry {
  const all = availableProviders();
  if (all.length === 0) {
    throw new AllProvidersExhaustedError([
      { name: "*", error: "No API keys set. Add at least one to .env." },
    ]);
  }
  return all[0]!;
}

export async function withFallback<T>(
  fn: (entry: ProviderEntry) => Promise<T>
): Promise<{ result: T; provider: string }> {
  const providers = availableProviders();
  if (providers.length === 0) {
    throw new AllProvidersExhaustedError([{ name: "*", error: "No API keys configured." }]);
  }
  const attempts: { name: string; error: string }[] = [];
  for (const p of providers) {
    try {
      const result = await fn(p);
      return { result, provider: p.name };
    } catch (err) {
      const e = err as { status?: number; statusCode?: number; message?: string };
      const status = e.status ?? e.statusCode;
      const retryable = status === 429 || (status !== undefined && status >= 500) || status === undefined;
      attempts.push({ name: p.name, error: `${status ?? "?"} ${e.message ?? String(err)}` });
      if (!retryable) throw err;
    }
  }
  throw new AllProvidersExhaustedError(attempts);
}
