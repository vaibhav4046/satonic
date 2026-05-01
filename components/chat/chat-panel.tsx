"use client";
import type { Message } from "ai";
import { useEffect, useRef } from "react";
import { Sparkles, Square, RotateCcw, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "./message";
import { StreamingIndicator } from "./streaming-indicator";

type Props = {
  messages: Message[];
  input: string;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e?: { preventDefault?: () => void }) => void;
  isLoading: boolean;
  onStop: () => void;
  onReload: () => void;
  error: Error | undefined;
  examplePrompts: string[];
  onClearAll: () => void;
};

export function ChatPanel({
  messages,
  input,
  onInputChange,
  onSubmit,
  isLoading,
  onStop,
  onReload,
  error,
  examplePrompts,
  onClearAll,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      if (input.trim() && !isLoading) onSubmit();
    }
  };

  const onExampleClick = (text: string) => {
    onInputChange({ target: { value: text } } as React.ChangeEvent<HTMLTextAreaElement>);
    setTimeout(() => onSubmit(), 50);
  };

  return (
    <div className="flex h-full w-full max-w-[640px] flex-col border-r border-border">
      <header className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-foreground text-background flex items-center justify-center">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-sm font-semibold leading-none">Satonic</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Open-source lead-gen chatbot</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={onClearAll} className="text-muted-foreground">
              <Trash2 className="h-3.5 w-3.5" />
              Clear
            </Button>
          )}
        </div>
      </header>

      <ScrollArea className="flex-1">
        <div ref={scrollRef} className="px-5 py-6 space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-fade-in">
              <div className="h-12 w-12 rounded-2xl bg-foreground text-background flex items-center justify-center">
                <Sparkles className="h-6 w-6" />
              </div>
              <div className="space-y-2 max-w-md">
                <h2 className="text-2xl font-semibold tracking-tight">What leads are you looking for?</h2>
                <p className="text-sm text-muted-foreground">
                  Describe your ideal customer in one sentence. I'll search public sources, enrich with email + phone, and stream results to the right.
                </p>
              </div>
              <div className="grid w-full gap-2 max-w-md">
                {examplePrompts.map((p) => (
                  <button
                    key={p}
                    onClick={() => onExampleClick(p)}
                    className="text-left text-sm px-4 py-3 rounded-lg border border-border/60 hover:border-foreground/30 hover:bg-accent/50 transition-colors text-muted-foreground hover:text-foreground"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((m) => (
                <ChatMessage key={m.id} message={m} />
              ))}
              {isLoading && <StreamingIndicator />}
              {error && (
                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
                  <p className="font-medium text-destructive">Error</p>
                  <p className="text-muted-foreground mt-1">{error.message}</p>
                  <Button variant="outline" size="sm" className="mt-3" onClick={onReload}>
                    <RotateCcw className="h-3.5 w-3.5" />
                    Retry
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (input.trim() && !isLoading) onSubmit();
        }}
        className="border-t border-border/50 p-4"
      >
        <div className="relative">
          <Textarea
            value={input}
            onChange={onInputChange}
            onKeyDown={onKeyDown}
            placeholder="Find me 50 dental clinics in Miami with phone numbers..."
            rows={2}
            className="pr-12 min-h-[58px] max-h-40 resize-none"
            disabled={isLoading}
          />
          <div className="absolute right-2 bottom-2">
            {isLoading ? (
              <Button type="button" size="icon" variant="secondary" onClick={onStop}>
                <Square className="h-3.5 w-3.5 fill-current" />
              </Button>
            ) : (
              <Button type="submit" size="icon" disabled={!input.trim()}>
                <Send className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 px-1">
          Public data only. Respects robots.txt. No LinkedIn scraping.
        </p>
      </form>
    </div>
  );
}
