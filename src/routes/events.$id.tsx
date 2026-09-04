import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import {
  ArrowLeft,
  Ban,
  BrainCircuit,
  CheckCircle2,
  Eye,
  Gauge,
  History,
  MapPinned,
  Satellite,
  Sparkles,
} from "lucide-react";
import { useTerraPulse } from "@/hooks/useTerraPulse";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ClassBadge, ConfidenceBadge, RiskBadge, StatusBadge } from "@/components/badges";
import { CLASS_LABELS, formatDateTime, formatDistance, persistenceBand, riskLevel } from "@/utils/labels";
import { escalation } from "@/services/riskService";
import type { VerificationStatus } from "@/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/events/$id")({
  head: () => ({
    meta: [
      { title: "Thermal Anomaly Details — TerraPulse" },
      { name: "description", content: "Full thermal observation, geographic context, persistence timeline, prototype AI classification, explainability factors and human verification actions for a single thermal anomaly." },
      { property: "og:title", content: "Thermal Anomaly Details — TerraPulse" },
      { property: "og:description", content: "Observation, context, persistence, classification, explainability and verification for one thermal anomaly." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EventDetailPage,
});

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b border-border/50 py-1.5 last:border-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-right text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}

function SectionCard({
  title,
  description,
  icon: Icon,
  children,
  className,
}: {
  title: string;
  description?: string;
  icon: typeof Satellite;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <span className="rounded-md bg-primary/10 p-1.5"><Icon className="h-4 w-4 text-primary" /></span>
          {title}
        </CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function EventDetailPage() {
  const { id } = useParams({ from: "/events/$id" });
  const { events, setStatus } = useTerraPulse();
  const event = events.find((e) => e.id === id);

  if (!event) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <p className="text-sm text-muted-foreground">No thermal anomaly found with id {id}.</p>
        <Link to="/" className="mt-3 inline-block text-sm font-medium text-primary hover:underline">
          Back to dashboard
        </Link>
      </div>
    );
  }

  const level = riskLevel(event.riskScore);
  const esc = escalation(level);
  const band = persistenceBand(event.persistenceCount);

  const act = (status: VerificationStatus, label: string) => {
    setStatus(event.id, status);
    toast.success(`${event.id} — status set to ${label}`);
  };

  const riskFactors = [
    { label: "Thermal intensity", value: Math.min(event.frp / 60, 1) },
    { label: "Facility proximity", value: Math.max(0, 1 - event.facilityDistance / 5000) },
    { label: "Persistence", value: Math.min(event.persistenceCount / 6, 1) },
    { label: "Land-cover context", value: event.landCover === "Industrial" ? 1 : event.landCover === "Forest" ? 0.7 : 0.4 },
    { label: "Classification confidence", value: event.confidence },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to dashboard
          </Link>
          <h2 className="font-mono text-lg font-semibold text-foreground">{event.id}</h2>
          <div className="flex flex-wrap items-center gap-2">
            <ClassBadge probableClass={event.probableClass} />
            <ConfidenceBadge value={event.confidence} />
            <RiskBadge score={event.riskScore} />
            <StatusBadge status={event.verificationStatus} />
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <SectionCard title="A. Thermal observation" description="NASA FIRMS thermal anomaly record" icon={Satellite}>
          <dl>
            <Row label="Satellite / sensor" value={event.sensor} />
            <Row label="Fire radiative power" value={`${event.frp} MW`} />
            <Row label="Brightness temperature" value={`${event.brightnessTemperature} K`} />
            <Row label="Detection time" value={formatDateTime(event.timestamp)} />
            <Row label="Latitude" value={event.latitude.toFixed(4)} />
            <Row label="Longitude" value={event.longitude.toFixed(4)} />
          </dl>
        </SectionCard>

        <SectionCard title="B. Geographic context" description="OpenStreetMap context around the detection footprint" icon={MapPinned}>
          <dl>
            <Row label="Nearest industrial facility" value={event.facilityName} />
            <Row label="Facility type" value={event.facilityType} />
            <Row label="Distance" value={formatDistance(event.facilityDistance)} />
            <Row label="Land-cover context" value={event.landCover} />
            <Row label="Nearby road" value={event.nearbyRoad} />
            <Row label="Nearby settlement" value={event.nearbySettlement} />
            <Row label="Region" value={event.region} />
          </dl>
        </SectionCard>

        <SectionCard title="C. Persistence analysis" description="Recurring thermal activity within the observation window" icon={History}>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-md bg-secondary p-3">
              <p className="text-[11px] uppercase text-muted-foreground">Detections</p>
              <p className="text-2xl font-semibold tabular-nums text-foreground">{event.persistenceCount}</p>
            </div>
            <div className="rounded-md bg-secondary p-3">
              <p className="text-[11px] uppercase text-muted-foreground">Window</p>
              <p className="text-2xl font-semibold tabular-nums text-foreground">{event.observationWindowDays}d</p>
            </div>
            <div className="rounded-md bg-secondary p-3">
              <p className="text-[11px] uppercase text-muted-foreground">Status</p>
              <p className="mt-1 text-sm font-semibold text-foreground">{band}</p>
            </div>
          </div>

          <div className="mt-4">
            <div className="relative flex items-center justify-between">
              <div className="absolute inset-x-0 top-1.5 h-0.5 bg-border" />
              {event.history.map((h, i) => {
                const day = Math.max(
                  1,
                  Math.round(
                    (new Date(h.timestamp).getTime() - new Date(event.history[0]!.timestamp).getTime()) /
                      86400000,
                  ) + 1,
                );
                return (
                  <div key={h.timestamp} className="relative flex flex-col items-center gap-1">
                    <span className="h-3 w-3 rounded-full border-2 border-background bg-risk-high" />
                    <span className="text-[11px] font-medium text-foreground">Day {day}</span>
                    <span className="text-[11px] text-muted-foreground">Detected</span>
                    <span className="text-[11px] text-muted-foreground">{h.frp} MW</span>
                    <span className="sr-only">detection {i + 1}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <p className="mt-4 text-sm font-medium text-foreground">
            {event.persistenceCount} detections in the last {event.observationWindowDays} days
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Historical observations are used to identify recurring thermal activity and persistent sources.
            Repeated detections alone do not indicate an industrial fire.
          </p>
        </SectionCard>

        <SectionCard title="D. Prototype AI classification" description="Probable source classification — not a confirmed fire" icon={BrainCircuit}>
          <div className="space-y-2.5">
            {event.probabilities.slice(0, 4).map((p) => (
              <div key={p.probableClass}>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-foreground">{CLASS_LABELS[p.probableClass]}</span>
                  <span className="font-semibold tabular-nums text-foreground">
                    {Math.round(p.probability * 100)}%
                  </span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${p.probability * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Prototype AI Classification — deterministic feature-based scoring, presented as a probable
            source classification. No trained-model accuracy is claimed.
          </p>
        </SectionCard>

        <SectionCard title="E. Explainability" description="Evidence behind the probable classification" icon={Sparkles}>
          <ul className="space-y-2.5">
            {event.explanationFactors.map((f) => (
              <li key={f.factor}>
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="font-medium text-foreground">{f.factor}</span>
                  <span className="tabular-nums text-muted-foreground">{Math.round(f.weight * 100)}%</span>
                </div>
                <p className="text-[11px] text-muted-foreground">{f.detail}</p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">
            Classification is based on combined thermal, geographic and temporal evidence.
          </p>
        </SectionCard>

        <SectionCard title="Risk score" description="Prototype decision-support score" icon={Gauge}>
          <div className="flex items-end gap-3">
            <p className="text-4xl font-semibold tabular-nums text-foreground">{event.riskScore}</p>
            <p className="pb-1 text-sm text-muted-foreground">/ 100</p>
            <RiskBadge score={event.riskScore} className="mb-1.5 ml-auto" />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {esc.label} — {esc.detail}
          </p>
          <div className="mt-4 space-y-2">
            {riskFactors.map((f) => (
              <div key={f.label}>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-foreground">{f.label}</span>
                  <span className="tabular-nums text-muted-foreground">{Math.round(f.value * 100)}%</span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className={cn("h-full rounded-full", level === "HIGH" ? "bg-risk-high" : level === "MEDIUM" ? "bg-risk-medium" : "bg-risk-low")}
                    style={{ width: `${f.value * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">Prototype decision-support score.</p>
        </SectionCard>
      </div>

      <SectionCard title="F. Human verification" description="Every classification requires an analyst decision" icon={CheckCircle2}>
        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => act("HUMAN_VERIFIED", "Human Verified")} className="gap-1.5">
            <CheckCircle2 className="h-4 w-4" /> Verify Event
          </Button>
          <Button variant="outline" onClick={() => act("DISMISSED", "Dismissed")} className="gap-1.5">
            <Ban className="h-4 w-4" /> Dismiss
          </Button>
          <Button variant="outline" onClick={() => act("NEEDS_REVIEW", "Needs Further Review")} className="gap-1.5">
            <Eye className="h-4 w-4" /> Needs Further Review
          </Button>
          <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
            Current status: <StatusBadge status={event.verificationStatus} />
          </div>
        </div>

        <div className="mt-4 space-y-1.5 border-t border-border pt-3">
          <p className="text-xs font-medium text-foreground">Audit log</p>
          {event.auditLog.map((a, i) => (
            <p key={`${a.at}-${i}`} className="text-[11px] text-muted-foreground">
              {formatDateTime(a.at)} — {a.action}
            </p>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
