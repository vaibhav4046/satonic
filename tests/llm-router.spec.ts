import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { availableProviders, AllProvidersExhaustedError } from "@/lib/llm/router";

const ENV_KEYS = [
  "NVIDIA_NIM_API_KEY",
  "GROQ_API_KEY",
  "CEREBRAS_API_KEY",
  "OPENROUTER_API_KEY",
] as const;

describe("LLM router", () => {
  const saved: Record<string, string | undefined> = {};

  beforeEach(() => {
    for (const k of ENV_KEYS) {
      saved[k] = process.env[k];
      delete process.env[k];
    }
  });

  afterEach(() => {
    for (const k of ENV_KEYS) {
      if (saved[k] !== undefined) process.env[k] = saved[k];
      else delete process.env[k];
    }
  });

  it("returns empty when no keys set", () => {
    expect(availableProviders()).toHaveLength(0);
  });

  it("includes nvidia first when only nvidia set", () => {
    process.env.NVIDIA_NIM_API_KEY = "test-key";
    const ps = availableProviders();
    expect(ps).toHaveLength(1);
    expect(ps[0]?.name).toBe("nvidia-nim");
  });

  it("orders nvidia → groq → cerebras → openrouter", () => {
    process.env.NVIDIA_NIM_API_KEY = "k1";
    process.env.GROQ_API_KEY = "k2";
    process.env.CEREBRAS_API_KEY = "k3";
    process.env.OPENROUTER_API_KEY = "k4";
    const names = availableProviders().map((p) => p.name);
    expect(names).toEqual(["nvidia-nim", "groq", "cerebras", "openrouter"]);
  });

  it("AllProvidersExhaustedError is informative", () => {
    const e = new AllProvidersExhaustedError([{ name: "groq", error: "429 rate limit" }]);
    expect(e.message).toContain("groq");
    expect(e.message).toContain("429");
  });
});
