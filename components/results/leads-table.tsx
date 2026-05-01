"use client";
import { Mail, Phone, Globe, MapPin, Youtube, ExternalLink } from "lucide-react";
import type { Lead } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { useLeadStore } from "@/lib/store";

function ScorePill({ score }: { score: number }) {
  const variant = score >= 75 ? "success" : score >= 50 ? "default" : "secondary";
  return (
    <Badge variant={variant} className="font-mono text-[10px] tabular-nums">
      {score}
    </Badge>
  );
}

function SocialIcon({ platform }: { platform: string }) {
  if (platform === "youtube") return <Youtube className="h-3.5 w-3.5" />;
  return <ExternalLink className="h-3.5 w-3.5" />;
}

export function LeadsTable({ leads }: { leads: Lead[] }) {
  const { selectedIds, toggleSelect, selectAll, clearSelection } = useLeadStore();
  const allSelected = leads.length > 0 && leads.every((l) => selectedIds.has(l.id));

  return (
    <Table>
      <TableHeader className="sticky top-0 bg-background/95 backdrop-blur z-10">
        <TableRow>
          <TableHead className="w-10">
            <input
              type="checkbox"
              className="h-3.5 w-3.5 rounded border-border"
              checked={allSelected}
              onChange={(e) => (e.target.checked ? selectAll() : clearSelection())}
            />
          </TableHead>
          <TableHead className="min-w-[200px]">Name</TableHead>
          <TableHead className="min-w-[180px]">Contact</TableHead>
          <TableHead>Location</TableHead>
          <TableHead>Source</TableHead>
          <TableHead className="text-right">Score</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leads.map((l) => (
          <TableRow key={l.id} className="group">
            <TableCell>
              <input
                type="checkbox"
                className="h-3.5 w-3.5 rounded border-border"
                checked={selectedIds.has(l.id)}
                onChange={() => toggleSelect(l.id)}
              />
            </TableCell>
            <TableCell>
              <div className="space-y-1 min-w-0">
                <div className="font-medium text-sm truncate">{l.name}</div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Badge variant="outline" className="text-[10px] capitalize">
                    {l.type}
                  </Badge>
                  {l.category && (
                    <span className="text-[10px] text-muted-foreground truncate max-w-[160px]">{l.category}</span>
                  )}
                </div>
                {l.social.length > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    {l.social.slice(0, 3).map((s) => (
                      <a
                        key={s.url}
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 hover:text-foreground"
                      >
                        <SocialIcon platform={s.platform} />
                        {s.followers !== undefined && (
                          <span className="tabular-nums">{formatCount(s.followers)}</span>
                        )}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </TableCell>
            <TableCell>
              <div className="space-y-1 text-xs">
                {l.email && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="h-3 w-3 text-muted-foreground" />
                    <a href={`mailto:${l.email}`} className="hover:text-foreground truncate max-w-[160px]">
                      {l.email}
                    </a>
                    {l.email_confidence > 0 && (
                      <span className="text-[10px] text-muted-foreground tabular-nums">{l.email_confidence}%</span>
                    )}
                  </div>
                )}
                {l.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="h-3 w-3 text-muted-foreground" />
                    <a href={`tel:${l.phone}`} className="hover:text-foreground tabular-nums">
                      {l.phone}
                    </a>
                  </div>
                )}
                {l.website && (
                  <div className="flex items-center gap-1.5">
                    <Globe className="h-3 w-3 text-muted-foreground" />
                    <a
                      href={l.website}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-foreground truncate max-w-[160px]"
                    >
                      {hostname(l.website)}
                    </a>
                  </div>
                )}
              </div>
            </TableCell>
            <TableCell>
              {l.location && (l.location.city || l.location.country) ? (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate max-w-[120px]">
                    {[l.location.city, l.location.country].filter(Boolean).join(", ")}
                  </span>
                </div>
              ) : (
                <span className="text-xs text-muted-foreground">—</span>
              )}
            </TableCell>
            <TableCell>
              <Badge variant="outline" className="font-mono text-[10px]">
                {l.source}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <ScorePill score={l.score} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function hostname(url: string): string {
  try {
    return new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}
