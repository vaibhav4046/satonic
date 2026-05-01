"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Lead } from "@/lib/types";

type SortKey = "score" | "name" | "source";

type State = {
  leads: Lead[];
  warnings: string[];
  sourcesUsed: string[];
  partial: boolean;
  sortKey: SortKey;
  filterText: string;
  selectedIds: Set<string>;
  addLeads: (incoming: Lead[]) => void;
  addWarnings: (w: string[]) => void;
  addSources: (s: string[]) => void;
  setPartial: (v: boolean) => void;
  setSortKey: (k: SortKey) => void;
  setFilterText: (s: string) => void;
  toggleSelect: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  reset: () => void;
};

export const useLeadStore = create<State>()(
  persist(
    (set, get) => ({
      leads: [],
      warnings: [],
      sourcesUsed: [],
      partial: false,
      sortKey: "score",
      filterText: "",
      selectedIds: new Set(),
      addLeads: (incoming) =>
        set((s) => {
          const map = new Map(s.leads.map((l) => [l.id, l]));
          for (const lead of incoming) {
            const prev = map.get(lead.id);
            if (!prev) {
              map.set(lead.id, lead);
              continue;
            }
            map.set(lead.id, {
              ...prev,
              ...lead,
              email: lead.email ?? prev.email,
              phone: lead.phone ?? prev.phone,
              website: lead.website ?? prev.website,
              social: prev.social.length >= lead.social.length ? prev.social : lead.social,
              score: Math.max(prev.score, lead.score),
            });
          }
          return { leads: Array.from(map.values()) };
        }),
      addWarnings: (w) =>
        set((s) => ({ warnings: Array.from(new Set([...s.warnings, ...w])) })),
      addSources: (sources) =>
        set((s) => ({ sourcesUsed: Array.from(new Set([...s.sourcesUsed, ...sources])) })),
      setPartial: (v) => set({ partial: v }),
      setSortKey: (k) => set({ sortKey: k }),
      setFilterText: (s) => set({ filterText: s }),
      toggleSelect: (id) =>
        set((s) => {
          const next = new Set(s.selectedIds);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return { selectedIds: next };
        }),
      selectAll: () => set((s) => ({ selectedIds: new Set(s.leads.map((l) => l.id)) })),
      clearSelection: () => set({ selectedIds: new Set() }),
      reset: () =>
        set({
          leads: [],
          warnings: [],
          sourcesUsed: [],
          partial: false,
          selectedIds: new Set(),
          filterText: "",
        }),
    }),
    {
      name: "satonic-leads",
      partialize: (s) => ({
        leads: s.leads,
        warnings: s.warnings,
        sourcesUsed: s.sourcesUsed,
      }),
    }
  )
);

export function selectVisibleLeads(state: State): Lead[] {
  const filter = state.filterText.trim().toLowerCase();
  let arr = state.leads;
  if (filter) {
    arr = arr.filter((l) =>
      [l.name, l.email, l.phone, l.website, l.category, l.location?.city, l.location?.country]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(filter))
    );
  }
  return [...arr].sort((a, b) => {
    if (state.sortKey === "score") return b.score - a.score;
    if (state.sortKey === "name") return a.name.localeCompare(b.name);
    return a.source.localeCompare(b.source);
  });
}
