"use client";
import { useState } from "react";
import { Download, Copy, Search, ArrowUpDown, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLeadStore, selectVisibleLeads } from "@/lib/store";
import { useShallow } from "zustand/react/shallow";
import { toast } from "sonner";
import { leadsToCsv } from "@/lib/utils/csv";

export function ExportBar() {
  const [busy, setBusy] = useState(false);
  const { leads, allLeads, selectedIds, sortKey, setSortKey, filterText, setFilterText, reset } = useLeadStore(
    useShallow((s) => ({
      leads: selectVisibleLeads(s),
      allLeads: s.leads,
      selectedIds: s.selectedIds,
      sortKey: s.sortKey,
      setSortKey: s.setSortKey,
      filterText: s.filterText,
      setFilterText: s.setFilterText,
      reset: s.reset,
    }))
  );

  const exportTarget = selectedIds.size > 0 ? allLeads.filter((l) => selectedIds.has(l.id)) : leads;

  const onExportCsv = async () => {
    if (exportTarget.length === 0) {
      toast.error("Nothing to export");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ leads: exportTarget }),
      });
      if (!res.ok) throw new Error(`Export failed: ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.headers.get("content-disposition")?.match(/filename="([^"]+)"/)?.[1] ?? "satonic-leads.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${exportTarget.length} leads`);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const onCopyCsv = async () => {
    if (exportTarget.length === 0) {
      toast.error("Nothing to copy");
      return;
    }
    const csv = leadsToCsv(exportTarget);
    await navigator.clipboard.writeText(csv);
    toast.success(`Copied ${exportTarget.length} leads to clipboard`);
  };

  const cycleSort = () => {
    setSortKey(sortKey === "score" ? "name" : sortKey === "name" ? "source" : "score");
  };

  return (
    <div className="flex items-center gap-2 px-5 py-2 border-b border-border/50 bg-background/40">
      <div className="relative flex-1 max-w-xs">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          placeholder="Filter leads..."
          className="pl-8 h-8 text-xs"
        />
      </div>
      <Button variant="ghost" size="sm" onClick={cycleSort} className="text-xs">
        <ArrowUpDown className="h-3.5 w-3.5" />
        sort: {sortKey}
      </Button>
      <div className="flex-1" />
      {selectedIds.size > 0 && (
        <span className="text-xs text-muted-foreground tabular-nums">{selectedIds.size} selected</span>
      )}
      <Button variant="outline" size="sm" onClick={onCopyCsv} disabled={exportTarget.length === 0}>
        <Copy className="h-3.5 w-3.5" />
        Copy
      </Button>
      <Button size="sm" onClick={onExportCsv} disabled={busy || exportTarget.length === 0}>
        {busy ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
        Export CSV
      </Button>
      <Button variant="ghost" size="sm" onClick={reset} className="text-muted-foreground" title="Clear results">
        ×
      </Button>
    </div>
  );
}
