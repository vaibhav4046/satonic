"use client";
import { useChat } from "ai/react";
import { useEffect, useMemo, useRef } from "react";
import { ChatPanel } from "./chat-panel";
import { ResultsPanel } from "@/components/results/results-panel";
import { useLeadStore } from "@/lib/store";
import type { Lead } from "@/lib/types";
import { LeadSchema } from "@/lib/types";

type ToolResultPayload =
  | { leads?: unknown; source?: string; warnings?: string[] }
  | { e164?: string | null; valid?: boolean }
  | { email?: string | null; pattern?: string | null; confidence?: number; candidates_tried?: number }
  | { valid?: boolean; records?: string[] }
  | undefined;

function extractLeadsFromToolResult(result: ToolResultPayload): { leads: Lead[]; source?: string; warnings: string[] } {
  if (!result || typeof result !== "object") return { leads: [], warnings: [] };
  const r = result as Record<string, unknown>;
  const out: Lead[] = [];
  if (Array.isArray(r.leads)) {
    for (const item of r.leads) {
      const parsed = LeadSchema.safeParse(item);
      if (parsed.success) out.push(parsed.data);
    }
  }
  return {
    leads: out,
    source: typeof r.source === "string" ? r.source : undefined,
    warnings: Array.isArray(r.warnings) ? (r.warnings as string[]) : [],
  };
}

export function ChatSurface() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, stop, reload, error, setMessages } = useChat({
    api: "/api/chat",
    maxSteps: 8,
  });

  const { addLeads, addWarnings, addSources, reset } = useLeadStore();
  const lastProcessedIdx = useRef(0);

  useEffect(() => {
    for (let i = lastProcessedIdx.current; i < messages.length; i++) {
      const msg = messages[i];
      if (!msg) continue;
      const parts = (msg as { parts?: Array<{ type: string; toolInvocation?: { state?: string; result?: unknown } }> })
        .parts;
      if (!parts) continue;
      for (const p of parts) {
        if (p.type === "tool-invocation" && p.toolInvocation?.state === "result") {
          const { leads, source, warnings } = extractLeadsFromToolResult(p.toolInvocation.result as ToolResultPayload);
          if (leads.length > 0) addLeads(leads);
          if (source) addSources([source]);
          if (warnings.length > 0) addWarnings(warnings);
        }
      }
    }
    lastProcessedIdx.current = messages.length;
  }, [messages, addLeads, addWarnings, addSources]);

  const examplePrompts = useMemo(
    () => [
      "find 30 dental clinics in Miami with phone numbers",
      "find SaaS companies in Berlin with careers pages",
      "find fitness creators on YouTube with 50k–200k subs in keto niche",
      "find yoga studios in Austin Texas",
      "find agencies in San Francisco doing SEO for e-commerce brands",
    ],
    []
  );

  const onClearAll = () => {
    setMessages([]);
    reset();
    lastProcessedIdx.current = 0;
  };

  return (
    <div className="flex h-full w-full">
      <ChatPanel
        messages={messages}
        input={input}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        onStop={stop}
        onReload={reload}
        error={error}
        examplePrompts={examplePrompts}
        onClearAll={onClearAll}
      />
      <ResultsPanel />
    </div>
  );
}
