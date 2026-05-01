import { Sparkles } from "lucide-react";

export function StreamingIndicator() {
  return (
    <div className="flex gap-3 animate-fade-in">
      <div className="h-7 w-7 rounded-md bg-foreground text-background flex items-center justify-center shrink-0">
        <Sparkles className="h-3.5 w-3.5 animate-pulse-soft" />
      </div>
      <div className="flex items-center gap-1 pt-2">
        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
    </div>
  );
}
