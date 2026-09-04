import { createFileRoute } from "@tanstack/react-router";
import { BellRing, Mail, MessageSquare, Smartphone } from "lucide-react";
import { useTerraPulse } from "@/hooks/useTerraPulse";
import { prioritise } from "@/services/riskService";
import { buildNotification, channelStatus, type Channel } from "@/services/notificationService";
import { riskLevel, formatDateTime } from "@/utils/labels";
import { ClassBadge, RiskBadge } from "@/components/badges";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/alerts")({
  head: () => ({
    meta: [
      { title: "Alerts — TerraPulse" },
      { name: "description", content: "In-app alerts generated for high and medium risk thermal detections, plus notification channel status." },
      { property: "og:title", content: "Alerts — TerraPulse" },
      { property: "og:description", content: "In-app alerts for high and medium risk thermal detections." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AlertsPage,
});

const CHANNEL_ICON: Record<Channel, typeof BellRing> = {
  IN_APP: BellRing,
  EMAIL: Mail,
  SMS: MessageSquare,
  PUSH: Smartphone,
};

function AlertsPage() {
  const { events } = useTerraPulse();
  const channels = channelStatus();
  const actionable = prioritise(events).filter(
    (e) => riskLevel(e.riskScore) !== "LOW",
  );
  const notifications = actionable.map(buildNotification);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Alerts</h2>
        <p className="text-sm text-muted-foreground">
          {notifications.length} actionable alerts (medium / high risk). Only in-app delivery is active in the prototype.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_minmax(0,300px)]">
        <div className="space-y-3">
          {notifications.map((n) => {
            const event = actionable.find((e) => e.id === n.eventId)!;
            const tone =
              n.level === "HIGH"
                ? "border-risk-high/30 bg-risk-high/5"
                : n.level === "MEDIUM"
                  ? "border-risk-medium/30 bg-risk-medium/5"
                  : "border-border bg-card";
            return (
              <div key={n.eventId} className={cn("rounded-lg border p-4 shadow-xs", tone)}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <BellRing className={cn("h-4 w-4", n.level === "HIGH" ? "text-risk-high" : "text-risk-medium")} />
                      <span className="font-semibold text-foreground">{n.title}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{n.body}</p>
                  </div>
                  <RiskBadge score={event.riskScore} />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <ClassBadge probableClass={event.probableClass} />
                  <ConfidenceBadge value={event.confidence} />
                  <StatusBadge status={event.verificationStatus} />
                </div>
                <p className="mt-2 text-xs font-medium text-foreground">
                  {escalation(n.level).label} — {escalation(n.level).detail}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/60 pt-3 text-xs text-muted-foreground">
                  <Button asChild size="sm" variant="outline" className="h-7 gap-1.5">
                    <Link to="/events/$id" params={{ id: event.id }}>
                      <ExternalLink className="h-3.5 w-3.5" /> View Event
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    className="h-7 gap-1.5"
                    disabled={event.verificationStatus === "HUMAN_VERIFIED"}
                    onClick={() => {
                      setStatus(event.id, "HUMAN_VERIFIED");
                      toast.success(`${event.id} — status set to Human Verified`);
                    }}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Verify
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 gap-1.5"
                    disabled={event.verificationStatus === "DISMISSED"}
                    onClick={() => {
                      setStatus(event.id, "DISMISSED");
                      toast.success(`${event.id} — status set to Dismissed`);
                    }}
                  >
                    <Ban className="h-3.5 w-3.5" /> Dismiss
                  </Button>
                  <span className="ml-auto">{event.region} · {formatDateTime(event.timestamp)} · {event.facilityName}</span>
                </div>
              </div>
            );
          })}
          {notifications.length === 0 && (
            <p className="rounded-lg border border-border bg-card p-6 text-center text-sm text-muted-foreground">
              No medium or high-risk alerts.
            </p>
          )}
        </div>

        <Card>
          <CardHeader><CardTitle className="text-sm">Notification channels</CardTitle></CardHeader>
          <CardContent className="space-y-2.5">
            {channels.map((c) => {
              const Icon = CHANNEL_ICON[c.channel];
              return (
                <div key={c.channel} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className={cn("rounded-md p-1.5", c.enabled ? "bg-ok/10 text-ok" : "bg-muted text-muted-foreground")}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{c.channel}</p>
                      <p className="text-[11px] text-muted-foreground">{c.note}</p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "rounded-md border px-2 py-0.5 text-[11px] font-semibold uppercase",
                      c.enabled ? "border-ok/30 bg-ok/10 text-ok" : "border-border bg-muted text-muted-foreground",
                    )}
                  >
                    {c.enabled ? "On" : "Off"}
                  </span>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
