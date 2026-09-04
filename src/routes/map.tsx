import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useState } from "react";
import { Layers } from "lucide-react";
import { useTerraPulse } from "@/hooks/useTerraPulse";
import { FiltersPanel } from "@/components/FiltersPanel";
import { ClientOnly } from "@/components/ClientOnly";
import { prioritise } from "@/services/riskService";

const MapView = lazy(() => import("@/components/MapView").then((m) => ({ default: m.MapView })));

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Thermal Events Live Map — TerraPulse" },
      { name: "description", content: "Geospatial view of detected thermal anomalies across the observation window, coloured by probable source class and scaled by radiative power." },
      { property: "og:title", content: "Thermal Events Live Map — TerraPulse" },
      { property: "og:description", content: "Geospatial view of detected thermal anomalies coloured by probable source class." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MapPage,
});

function MapPage() {
  const { filtered, filters, setFilters, resetFilters } = useTerraPulse();
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const sorted = prioritise(filtered);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Thermal events map</h2>
        <p className="text-sm text-muted-foreground">
          {filtered.length} detections · circle colour = probable class, size = radiative power (FRP).
        </p>
      </div>

      <ClientOnly
        fallback={
          <div className="flex h-[560px] items-center justify-center rounded-lg border border-border bg-muted text-sm text-muted-foreground">
            <Layers className="mr-2 h-4 w-4 animate-pulse" /> Loading map…
          </div>
        }
      >
        <Suspense fallback={<div className="h-[560px] rounded-lg border border-border bg-muted" />}>
          <MapView events={sorted} height={560} onSelect={setSelectedId} />
        </Suspense>
      </ClientOnly>

      <FiltersPanel filters={filters} setFilters={setFilters} resetFilters={resetFilters} resultCount={filtered.length} />

      {selectedId && (
        <p className="text-xs text-muted-foreground">
          Selected: <span className="font-mono text-foreground">{selectedId}</span>
        </p>
      )}
    </div>
  );
}
