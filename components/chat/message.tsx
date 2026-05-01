"use client";
import type { Message } from "ai";
import { Sparkles, User, Wrench, CheckCircle2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ToolPart = {
  type: "tool-invocation";
  toolInvocation: {
    toolName: string;
    state: "partial-call" | "call" | "result";
    args?: Record<string, unknown>;
    result?: unknown;
  };
};

type TextPart = { type: "text"; text: string };
type StepStartPart = { type: "step-start" };
type Part = ToolPart | TextPart | StepStartPart | { type: string };

function isTool(p: Part): p is ToolPart {
  return p.type === "tool-invocation";
}
function isText(p: Part): p is TextPart {
  return p.type === "text";
}

function summarizeArgs(args: Record<string, unknown> | undefined): string {
  if (!args) return "";
  const entries: string[] = [];
  if (typeof args.query === "string") entries.push(`"${args.query}"`);
  if (typeof args.location === "string" && args.location) entries.push(args.location);
  if (typeof args.full_name === "string") entries.push(args.full_name);
  if (typeof args.domain === "string") entries.push(args.domain);
  if (typeof args.username === "string") entries.push(`@${args.username}`);
  if (typeof args.limit === "number") entries.push(`limit=${args.limit}`);
  return entries.join(" · ");
}

function summarizeToolResult(toolName: string, result: unknown): string {
  if (!result || typeof result !== "object") return "done";
  const r = result as Record<string, unknown>;
  if (Array.isArray(r.leads)) {
    const count = r.leads.length;
    const warn = Array.isArray(r.warnings) && r.warnings.length > 0 ? ` · ${r.warnings.length} warning(s)` : "";
    return `${count} lead${count === 1 ? "" : "s"}${warn}`;
  }
  if (toolName === "enrich_email" && typeof r.email === "string") return `${r.email} (${r.confidence ?? 0}%)`;
  if (toolName === "enrich_email" && r.email === null) return "no match";
  if (toolName === "enrich_phone" && typeof r.e164 === "string") return r.e164;
  if (toolName === "verify_mx" && typeof r.valid === "boolean") return r.valid ? "MX valid" : "MX invalid";
  return "done";
}

export function ChatMessage({ message }: { message: Message }) {
  const role = message.role;
  const parts = (message as Message & { parts?: Part[] }).parts ?? [
    { type: "text", text: message.content } as TextPart,
  ];

  if (role === "user") {
    return (
      <div className="flex gap-3 animate-fade-in">
        <div className="h-7 w-7 rounded-md bg-secondary flex items-center justify-center shrink-0">
          <User className="h-3.5 w-3.5" />
        </div>
        <div className="flex-1 pt-0.5">
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3 animate-fade-in">
      <div className="h-7 w-7 rounded-md bg-foreground text-background flex items-center justify-center shrink-0">
        <Sparkles className="h-3.5 w-3.5" />
      </div>
      <div className="flex-1 space-y-2 pt-0.5 min-w-0">
        {parts.map((p, idx) => {
          if (isText(p) && p.text) {
            return (
              <p key={idx} className="text-sm whitespace-pre-wrap leading-relaxed">
                {p.text}
              </p>
            );
          }
          if (isTool(p)) {
            const ti = p.toolInvocation;
            const isResult = ti.state === "result";
            const isError =
              isResult &&
              typeof ti.result === "object" &&
              ti.result !== null &&
              Array.isArray((ti.result as { warnings?: unknown }).warnings) &&
              ((ti.result as { warnings: string[] }).warnings.some((w) => /error|failed|blocked/i.test(w)) ?? false);
            return (
              <div
                key={idx}
                className={cn(
                  "rounded-md border bg-muted/30 px-3 py-2 text-xs flex items-center gap-2 transition-colors",
                  isResult && !isError && "border-emerald-500/30",
                  isError && "border-amber-500/30"
                )}
              >
                {isResult ? (
                  isError ? (
                    <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  )
                ) : (
                  <Wrench className="h-3.5 w-3.5 text-muted-foreground shrink-0 animate-pulse-soft" />
                )}
                <Badge variant="outline" className="font-mono text-[10px]">
                  {ti.toolName}
                </Badge>
                <span className="text-muted-foreground truncate flex-1">
                  {summarizeArgs(ti.args)}
                </span>
                {isResult && (
                  <span className="text-foreground font-medium shrink-0">
                    {summarizeToolResult(ti.toolName, ti.result)}
                  </span>
                )}
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}
