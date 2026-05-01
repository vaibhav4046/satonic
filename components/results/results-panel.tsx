"use client";
import { useShallow } from "zustand/react/shallow";
import { useLeadStore, selectVisibleLeads } from "@/lib/store";
import { LeadsTable } from "./leads-table";
import { ExportBar } from "./export-bar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Inbox, AlertTriangle } from "lucide-react";

export function ResultsPanel() {
  const { leads, warnings, sourcesUsed, partial } = useLeadStore(
    useShallow((s) => ({
      leads: selectVisibleLeads(s),
      warnings: s.warnings,
      sourcesUsed: s.sourcesUsed,
      partial: s.partial,
    }))
  );

  return (
    <div className="flex h-full flex-1 flex-col bg-muted/20">
      <header className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border/50 bg-background/40">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold">Leads</h2>
          <Badge variant="secondary" className="font-mono text-[10px]">
            {leads.length}
          </Badge>
          {partial && <Badge variant="warning">partial</Badge>}
        </div>
        <div className="flex items-center gap-1.5 flex-wrap justify-end">
          {sourcesUsed.map((s) => (
            <Badge key={s} variant="outline" className="font-mono text-[10px]">
              {s}
            </Badge>
          ))}
        </div>
      </header>

      {warnings.length > 0 && (
        <div className="border-b border-amber-500/20 bg-amber-500/5 px-5 py-2 text-xs flex items-start gap-2">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
          <ul className="space-y-0.5 text-muted-foreground">
            {warnings.slice(0, 3).map((w, i) => (
              <li key={i}>{w}</li>
            ))}
            {warnings.length > 3 && <li>+{warnings.length - 3} more</li>}
          </ul>
        </div>
      )}

      <ExportBar />

      <ScrollArea className="flex-1">
        {leads.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center min-h-[60vh] px-6">
            <Inbox className="h-10 w-10 text-muted-foreground/40 mb-4" />
            <p className="text-sm font-medium">No leads yet</p>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
              Ask the chat for leads. Results stream here as the agent works.
            </p>
          </div>
        ) : (
          <LeadsTable leads={leads} />
        )}
      </ScrollArea>
    </div>
  );
}
