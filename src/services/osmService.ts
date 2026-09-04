import { FACILITIES } from "@/data/facilities";
import type { Facility } from "@/types";

/** Haversine distance in metres. */
export function distanceMeters(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
) {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export interface FacilityMatch {
  facility: Facility;
  distance: number;
}

/**
 * Demo OSM facility matching. Swap the FACILITIES source for an Overpass API
 * query later without changing the call signature.
 */
export function findNearestFacility(point: {
  latitude: number;
  longitude: number;
}): FacilityMatch | null {
  let best: FacilityMatch | null = null;
  for (const facility of FACILITIES) {
    const distance = distanceMeters(point, facility);
    if (!best || distance < best.distance) best = { facility, distance };
  }
  return best;
}

export function osmStatus() {
  return { name: "OpenStreetMap", status: "Available" as const };
}
