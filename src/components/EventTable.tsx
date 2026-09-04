import { useState } from "react";
import { CheckCircle2, Ban, Eye, History } from "lucide-react";
import type { ThermalEvent, VerificationStatus } from "@/types";
import { formatDateTime, formatDistance, persistenceBand } from "@/utils/labels";
import { ClassBadge, ConfidenceBadge, RiskBadge, StatusBadge } from "@/components/badges";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

type CtxActions = {
  setStatus: (id: string, status: VerificationStatus) => void;
};

const ACTIONS: { status: VerificationStatus; label: string; icon: typeof CheckCircle2; tone: string }[] = [
  { status: "HUMAN_VERIFIED", label: "Verify", icon: CheckCircle2, tone: "text-ok" },
  { status: "NEEDS_REVIEW", label: "Review", icon: Eye, tone: "text-risk-medium" },
  { status: "DISMISSED", label: "Dismiss", icon: Ban, tone: "text-muted-foreground" },
];

export function EventTable({
  events,
  ctx,
  onSelect,
  selectedId,
  maxHeight = "none",
}: {
  events: ThermalEvent[];
  ctx?: CtxActions;
  onSelect?: (id: string) => void;
  selectedId?: string | undefined;
  maxHeight?: string | undefined;
}) {
  const [open, setOpen] = useState<string | null>(null);

  const body = (
    <div className="w-full">
      <table className="w-full caption-bottom text-sm">
        <thead className="sticky top-0 z-10 bg-card">
          <tr className="border-b border-border text-left text-[11px] uppercase tracking-wide text-muted-foreground">
            <th className="px-3 py-2 font-medium">Event</th>
            <th className="px-3 py-2 font-medium">Class</th>
            <th className="px-3 py-2 font-medium">Risk</th>
            <th className="px-3 py-2 font-medium">Conf.</th>
            <th className="px-3 py-2 font-medium">Persistence</th>
            <th className="px-3 py-2 font-medium">Facility</th>
            <th className="px-3 py-2 font-medium">Detected</th>
            <th className="px-3 py-2 font-medium">Status</th>
            <th className="px-3 py-2 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e) => (
            <tr
              key={e.id}
              onClick={() => {
                onSelect?.(e.id);
                setOpen((cur) => (cur === e.id ? null : e.id));
              }}
              className={cn(
                "cursor-pointer border-b border-border/60 transition-colors hover:bg-accent/50",
                selectedId === e.id && "bg-accent/60",
              )}
            >
              <td className="px-3 py-2.5 align-top">
                <div className="font-mono text-xs font-semibold text-foreground">{e.id}</div>
                <div className="text-[11px] text-muted-foreground">{e.region}</div>
                <div className="text-[11px] text-muted-foreground">
                  {e.latitude.toFixed(3)}, {e.longitude.toFixed(3)}
                </div>
              </td>
              <td className="px-3 py-2.5 align-top"><ClassBadge probableClass={e.probableClass} /></td>
              <td className="px-3 py-2.5 align-top"><RiskBadge score={e.riskScore} /></td>
              <td className="px-3 py-2.5 align-top"><ConfidenceBadge value={e.confidence} /></td>
              <td className="px-3 py-2.5 align-top">
                <div className="text-xs font-medium text-foreground">{e.persistenceCount}×</div>
                <div className="text-[11px] text-muted-foreground">{persistenceBand(e.persistenceCount)}</div>
              </td>
              <td className="px-3 py-2.5 align-top">
                <div className="text-xs text-foreground">{e.facilityName}</div>
                <div className="text-[11px] text-muted-foreground">{e.facilityType} · {formatDistance(e.facilityDistance)}</div>
              </td>
              <td className="px-3 py-2.5 align-top text-[11px] text-muted-foreground">
                {formatDateTime(e.timestamp)}
                <div className="mt-0.5 inline-flex items-center gap-1">
                  <History className="h-3 w-3" /> {e.sensor}
                </div>
              </td>
              <td className="px-3 py-2.5 align-top"><StatusBadge status={e.verificationStatus} /></td>
              <td className="px-3 py-2.5 align-top">
                <div className="flex justify-end gap-1">
                  <Button asChild size="icon" variant="ghost" className="h-7 w-7" title="Open event details">
                    <Link to="/events/$id" params={{ id: e.id }} onClick={(ev) => ev.stopPropagation()}>
                      <ExternalLink className="h-4 w-4 text-primary" />
                    </Link>
                  </Button>
                  {ctx ? (
                    ACTIONS.map((a) => (
                      <Button
                        key={a.status}
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        title={a.label}
                        disabled={e.verificationStatus === a.status}
                        onClick={(ev) => {
                          ev.stopPropagation();
                          ctx.setStatus(e.id, a.status);
                        }}
                      >
                        <a.icon className={cn("h-4 w-4", a.tone)} />
                      </Button>
                    ))
                  ) : (
                    <span className="text-[11px] text-muted-foreground">—</span>
                  )}
                </div>
                {open === e.id && (
                  <div className="mt-2 rounded-md border border-border bg-secondary/50 p-2 text-[11px] text-muted-foreground">
                    <div>{e.nearbyRoad}</div>
                    <div>Settlement: {e.nearbySettlement}</div>
                    <div>Land cover: {e.landCover}{e.spatiallyExpanding ? " · expanding" : ""}</div>
                    <div>Active days: {e.activeDays}/{e.observationWindowDays}</div>
                    {e.history.length > 0 && (
                      <div className="mt-1">
                        FRP trend: {e.history.map((h) => h.frp).join(" → ")} MW
                      </div>
                    )}
                  </div>
                )}
              </td>
            </tr>
          ))}
          {events.length === 0 && (
            <tr>
              <td colSpan={9} className="px-3 py-8 text-center text-sm text-muted-foreground">
                No events match the current filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  if (maxHeight === "none") return body;
  return (
    <ScrollArea className={cn("w-full rounded-lg border border-border bg-card")} style={{ maxHeight }}>
      {body}
    </ScrollArea>
  );
}
