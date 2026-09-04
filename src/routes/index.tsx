import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useState } from "react";
import { Activity, Flame, Clock, ShieldAlert, Layers, Map as MapIcon } from "lucide-react";
import { useTerraPulse } from "@/hooks/useTerraPulse";
import { KpiCard } from "@/components/KpiCard";
import { WorkflowStrip } from "@/components/WorkflowStrip";
import { EventTable } from "@/components/EventTable";
import { FiltersPanel } from "@/components/FiltersPanel";
import { ClientOnly } from "@/components/ClientOnly";
import { DemoBadge } from "@/components/badges";
import { prioritise } from "@/services/riskService";
import { riskLevel } from "@/utils/labels";
import { Link } from "@tanstack/react-router";

const MapView = lazy(() => import("@/components/MapView").then((m) => ({ default: m.MapView })));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TerraPulse — Thermal Risk Detection Dashboard" },
      { name: "description", content: "Prototype AI classification of satellite thermal anomalies: industrial fires, gas flares, agricultural burning and wildfires with risk scoring and verification workflow." },
      { property: "og:title", content: "TerraPulse — Thermal Risk Detection Dashboard" },
      { property: "og:description", content: "Prototype AI classification of satellite thermal anomalies with risk scoring and verification workflow." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const tp = useTerraPulse();
  const { filtered, events, setStatus } = tp;
  const [selectedId, setSelectedId] = useState<string | undefined>();

  const total = events.length;
  const highRisk = events.filter((e) => riskLevel(e.riskScore) === "HIGH").length;
  const persistent = events.filter((e) => e.persistenceCount >= 4).length;
  const industrial = events.filter((e) => e.probableClass === "INDUSTRIAL_FIRE").length;

  const sorted = prioritise(filtered);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-risk-medium/30 bg-risk-medium/5 px-3 py-2">
        <DemoBadge />
        <p className="text-xs text-muted-foreground">
          Demo data is used for this prototype. FIRMS thermal anomalies are not automatically confirmed fires.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Active Thermal Anomalies" value={total} hint="In 7-day observation window" icon={Activity} />
        <KpiCard label="Possible Industrial Fires" value={industrial} hint="Probable source classification" icon={Flame} tone="high" />
        <KpiCard label="Persistent Thermal Sources" value={persistent} hint="≥ 4 detections in window" icon={Clock} tone="medium" />
        <KpiCard label="High-Risk Events" value={highRisk} hint="Risk score ≥ 80" icon={ShieldAlert} tone={highRisk > 0 ? "high" : "ok"} />
      </div>

      <WorkflowStrip />

      <section className="grid gap-5 lg:grid-cols-[1fr_minmax(0,420px)]">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Detection footprint map</h2>
            <Link
              to="/map"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
            >
              <MapIcon className="h-3.5 w-3.5" /> Open full map
            </Link>
          </div>
          <ClientOnly
            fallback={
              <div className="flex h-[380px] items-center justify-center rounded-lg border border-border bg-muted text-sm text-muted-foreground">
                <Layers className="mr-2 h-4 w-4 animate-pulse" /> Loading map…
              </div>
            }
          >
            <Suspense fallback={<div className="h-[380px] rounded-lg border border-border bg-muted" />}>
              <MapView events={sorted} height={380} onSelect={setSelectedId} />
            </Suspense>
          </ClientOnly>
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-foreground">Priority queue</h2>
          <EventTable
            events={sorted.slice(0, 8)}
            ctx={{ setStatus }}
            onSelect={setSelectedId}
            selectedId={selectedId}
            maxHeight="460px"
          />
        </div>
      </section>

      <FiltersPanel
        filters={tp.filters}
        setFilters={tp.setFilters}
        resetFilters={tp.resetFilters}
        resultCount={filtered.length}
      />

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">All filtered detections</h2>
          <span className="text-xs text-muted-foreground">{filtered.length} of {total}</span>
        </div>
        <EventTable events={sorted} ctx={{ setStatus }} onSelect={setSelectedId} selectedId={selectedId} />
      </section>
    </div>
  );
}
