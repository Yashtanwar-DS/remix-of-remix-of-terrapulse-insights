import type { ThermalEvent } from "@/types";

/**
 * Satellite imagery context service (Sentinel-2 / Landsat).
 * Demo mode returns a deterministic static map tile context descriptor; a real
 * imagery provider can be swapped in behind this same signature.
 */
export interface SatelliteContext {
  available: boolean;
  provider: string;
  note: string;
  tileUrl: string;
}

export function getSatelliteContext(event: ThermalEvent): SatelliteContext {
  const z = 13;
  const x = Math.floor(((event.longitude + 180) / 360) * 2 ** z);
  const latRad = (event.latitude * Math.PI) / 180;
  const y = Math.floor(
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * 2 ** z,
  );
  return {
    available: false,
    provider: "Sentinel-2 / Landsat (external source)",
    note: "High-resolution imagery is not connected in demo mode. The tile below is an OpenStreetMap context view of the detection footprint.",
    tileUrl: `https://tile.openstreetmap.org/${z}/${x}/${y}.png`,
  };
}
