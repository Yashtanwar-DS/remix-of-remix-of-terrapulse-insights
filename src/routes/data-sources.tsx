import { createFileRoute } from "@tanstack/react-router";
import { Satellite, MapPin, Database, BellRing, Cloud } from "lucide-react";
import { useTerraPulse } from "@/hooks/useTerraPulse";
import { firmsMode } from "@/services/firmsService";
import { osmStatus } from "@/services/osmService";
import { channelStatus } from "@/services/notificationService";
import { getSatelliteContext } from "@/services/satelliteService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/data-sources")({
  head: () => ({
    meta: [
      { title: "Data Sources & Settings — TerraPulse" },
      { name: "description", content: "Status of the thermal detection data sources: NASA FIRMS, OpenStreetMap context, satellite imagery and notification channels." },
      { property: "og:title", content: "Data Sources & Settings — TerraPulse" },
      { property: "og:description", content: "Status of thermal detection data sources and notification channels." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DataSourcesPage,
});

function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span
      className={cn(
        "inline-block h-2 w-2 rounded-full",
        ok ? "bg-ok" : "bg-risk-medium",
      )}
    />
  );
}

function DataSourcesPage() {
  const { events, mode } = useTerraPulse();
  const sample = events[0];
  const sat = sample ? getSatelliteContext(sample) : null;
  const channels = channelStatus();

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Data sources & settings</h2>
        <p className="text-sm text-muted-foreground">
          Prototype status of every ingest, context and delivery pipeline. Swap each behind its existing interface to go live.
        </p>
      </div>

      <div className="rounded-lg border border-primary/25 bg-primary/5 p-4">
        <p className="text-sm font-medium text-foreground">
          FIRMS detects thermal anomalies; TerraPulse uses additional context to classify their probable source.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {[
          { name: "NASA FIRMS", role: "Thermal anomaly observations" },
          { name: "VIIRS / MODIS", role: "Satellite fire / thermal observations" },
          { name: "OpenStreetMap", role: "Industrial and geographic context" },
          { name: "Sentinel-2 / Landsat", role: "Satellite imagery context" },
          { name: "Land cover", role: "Surrounding land-use context" },
        ].map((s) => (
          <div key={s.name} className="rounded-lg border border-border bg-card p-3 shadow-xs">
            <p className="text-sm font-semibold text-foreground">{s.name}</p>
            <p className="text-xs text-muted-foreground">→ {s.role}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm">
                <span className="rounded-md bg-primary/10 p-1.5"><Satellite className="h-4 w-4 text-primary" /></span>
                NASA FIRMS
              </CardTitle>
              <Badge variant={mode === "LIVE" ? "default" : "secondary"}>{mode}</Badge>
            </div>
            <CardDescription>Thermal anomaly ingest (MODIS / VIIRS)</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-1.5">
            <p className="flex items-center gap-2"><StatusDot ok={mode === "LIVE"} /> {mode === "LIVE" ? "Live feed connected" : "No FIRMS map key — demo dataset active"}</p>
            <p>{events.length} detections loaded from the bundled demo dataset.</p>
            <p className="text-[11px]">Set <code className="rounded bg-muted px-1">VITE_FIRMS_ENABLED=true</code> + a server-side key to activate <code className="rounded bg-muted px-1">/api/public/firms</code>.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm">
                <span className="rounded-md bg-primary/10 p-1.5"><MapPin className="h-4 w-4 text-primary" /></span>
                OpenStreetMap context
              </CardTitle>
              <Badge variant="default">{osmStatus().status}</Badge>
            </div>
            <CardDescription>Facility matching & base tiles</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-1.5">
            <p className="flex items-center gap-2"><StatusDot ok /> Nearest-facility matching against a demo facility table.</p>
            <p className="text-[11px]">Replace <code className="rounded bg-muted px-1">FACILITIES</code> with an Overpass API query behind the same signature.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm">
                <span className="rounded-md bg-primary/10 p-1.5"><Cloud className="h-4 w-4 text-primary" /></span>
                Satellite imagery
              </CardTitle>
              <Badge variant="secondary">{sat?.available ? "Live" : "Demo"}</Badge>
            </div>
            <CardDescription>Sentinel-2 / Landsat context</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-1.5">
            <p>{sat?.note}</p>
            <p className="text-[11px]">Provider: {sat?.provider}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm">
                <span className="rounded-md bg-primary/10 p-1.5"><BellRing className="h-4 w-4 text-primary" /></span>
                Notification channels
              </CardTitle>
              <Badge variant="secondary">{channels.filter((c) => c.enabled).length}/{channels.length} on</Badge>
            </div>
            <CardDescription>Alert delivery transports</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {channels.map((c) => (
              <div key={c.channel} className="flex items-center justify-between">
                <span className="text-foreground">{c.channel}</span>
                <span className={cn("text-xs", c.enabled ? "text-ok" : "text-muted-foreground")}>
                  {c.note}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <span className="rounded-md bg-primary/10 p-1.5"><Database className="h-4 w-4 text-primary" /></span>
            Classification engine
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-1.5">
          <p>Deterministic, feature-based scoring (FRP · facility distance · recurrence · land cover · expansion).</p>
          <p className="text-[11px]">The interface is intentionally narrow so a real XGBoost / Random Forest service can replace the internals without any UI change.</p>
        </CardContent>
      </Card>
    </div>
  );
}
