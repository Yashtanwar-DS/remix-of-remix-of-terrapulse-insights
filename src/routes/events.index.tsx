import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useTerraPulse } from "@/hooks/useTerraPulse";
import { EventTable } from "@/components/EventTable";
import { FiltersPanel } from "@/components/FiltersPanel";
import { DataStatusBar } from "@/components/DataStatusBar";
import { prioritise } from "@/services/riskService";

export const Route = createFileRoute("/events/")({
  head: () => ({
    meta: [
      { title: "Event Monitoring — TerraPulse Thermal Anomalies" },
      {
        name: "description",
        content:
          "Monitor every detected thermal anomaly with search, filters, probable source classification, risk score and human verification status.",
      },
      { property: "og:title", content: "Event Monitoring — TerraPulse" },
      {
        property: "og:description",
        content: "Search and filter thermal anomalies by risk, class, persistence and verification status.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EventMonitoring,
});

function EventMonitoring() {
  const tp = useTerraPulse();
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const sorted = prioritise(tp.filtered);

  return (
    <div className="space-y-5">
      <DataStatusBar />
      <FiltersPanel
        filters={tp.filters}
        setFilters={tp.setFilters}
        resetFilters={tp.resetFilters}
        resultCount={tp.filtered.length}
      />
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Monitored thermal anomalies</h2>
          <span className="text-xs text-muted-foreground">
            {tp.filtered.length} of {tp.events.length}
          </span>
        </div>
        <EventTable
          events={sorted}
          ctx={{ setStatus: tp.setStatus }}
          onSelect={setSelectedId}
          selectedId={selectedId}
        />
      </section>
    </div>
  );
}
