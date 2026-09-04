import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from "react-leaflet";
import L from "leaflet";
import type { ThermalEvent } from "@/types";
import { CLASS_COLOR, CLASS_LABELS, formatDistance, formatDateTime, riskLevel } from "@/utils/labels";
import { ClassBadge, RiskBadge } from "@/components/badges";

// Fix Leaflet's default icon path resolution under bundlers (unused by
// CircleMarker, but keeps any future Marker usage working).
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export function MapView({
  events,
  height = 380,
  onSelect,
}: {
  events: ThermalEvent[];
  height?: number;
  onSelect?: (id: string) => void;
}) {
  if (events.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border border-border bg-muted text-sm text-muted-foreground"
        style={{ height }}
      >
        No thermal events to display.
      </div>
    );
  }

  const latSum = events.reduce((s, e) => s + e.latitude, 0);
  const lngSum = events.reduce((s, e) => s + e.longitude, 0);
  const center: [number, number] = [latSum / events.length, lngSum / events.length];

  return (
    <div className="overflow-hidden rounded-lg border border-border" style={{ height }}>
      <MapContainer center={center} zoom={5} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {events.map((e) => {
          const level = riskLevel(e.riskScore);
          const radius = Math.max(6, Math.min(18, Math.round(e.frp / 3) + 6));
          const color = CLASS_COLOR[e.probableClass];
          return (
            <CircleMarker
              key={e.id}
              center={[e.latitude, e.longitude]}
              radius={radius}
              pathOptions={{
                color,
                weight: level === "HIGH" ? 2.5 : 1.5,
                fillColor: color,
                fillOpacity: 0.55,
              }}
              eventHandlers={{
                click: () => onSelect?.(e.id),
              }}
            >
              <Tooltip>
                <strong>{e.id}</strong> · {CLASS_LABELS[e.probableClass]}
              </Tooltip>
              <Popup minWidth={250}>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-sm font-semibold text-foreground">{e.id}</span>
                    <RiskBadge score={e.riskScore} />
                  </div>
                  <ClassBadge probableClass={e.probableClass} />
                  <dl className="space-y-0.5 text-muted-foreground">
                    <div><dt className="inline font-medium text-foreground">Confidence: </dt><dd className="inline">{Math.round(e.confidence * 100)}%</dd></div>
                    <div><dt className="inline font-medium text-foreground">FRP: </dt><dd className="inline">{e.frp} MW</dd></div>
                    <div><dt className="inline font-medium text-foreground">Detected: </dt><dd className="inline">{formatDateTime(e.timestamp)}</dd></div>
                    <div><dt className="inline font-medium text-foreground">Sensor: </dt><dd className="inline">{e.sensor}</dd></div>
                    <div><dt className="inline font-medium text-foreground">Nearest facility: </dt><dd className="inline">{e.facilityName} ({e.facilityType})</dd></div>
                    <div><dt className="inline font-medium text-foreground">Distance: </dt><dd className="inline">{formatDistance(e.facilityDistance)}</dd></div>
                    <div><dt className="inline font-medium text-foreground">Persistence: </dt><dd className="inline">{e.persistenceCount} detections / {e.observationWindowDays} days</dd></div>
                    <div><dt className="inline font-medium text-foreground">Risk score: </dt><dd className="inline">{e.riskScore}/100</dd></div>
                    <div><dt className="inline font-medium text-foreground">Status: </dt><dd className="inline">{STATUS_LABELS[e.verificationStatus]}</dd></div>
                  </dl>
                  <Link
                    to="/events/$id"
                    params={{ id: e.id }}
                    className="inline-flex items-center gap-1 pt-1 font-semibold text-primary hover:underline"
                  >
                    Open event details <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
