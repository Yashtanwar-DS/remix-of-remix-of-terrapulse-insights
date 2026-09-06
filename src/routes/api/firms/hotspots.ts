import { createFileRoute } from "@tanstack/react-router";

/**
 * Secure NASA FIRMS proxy.
 *
 * The FIRMS map key is read from the server environment only and is never
 * returned to the browser, logged, or included in any error message.
 */

// India bounding box (west, south, east, north) — never request worldwide data.
const INDIA_BBOX = "68,6,98,38";
const DAY_RANGE = 1;

// Prioritise NOAA-21 / NOAA-20, then S-NPP, with MODIS as an optional fallback.
const SOURCES = [
  "VIIRS_NOAA21_NRT",
  "VIIRS_NOAA20_NRT",
  "VIIRS_SNPP_NRT",
  "MODIS_NRT",
] as const;

export interface FirmsObservation {
  latitude: number;
  longitude: number;
  acq_date: string;
  acq_time: string;
  satellite: string;
  instrument: string;
  confidence: string;
  frp: number;
  bright_ti4: number | null;
  bright_ti5: number | null;
  daynight: string;
  scan: number | null;
  track: number | null;
  product: string;
}

interface CacheEntry {
  at: number;
  payload: { observations: FirmsObservation[]; sources: string[]; fetchedAt: string };
}

let cache: CacheEntry | undefined;
const CACHE_MS = 10 * 60 * 1000;

function num(value: string | undefined): number | null {
  if (value === undefined || value.trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function parseCsv(csv: string, source: string): FirmsObservation[] {
  const lines = csv.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const header = lines[0]!.split(",").map((h) => h.trim());
  const idx = (name: string) => header.indexOf(name);
  const out: FirmsObservation[] = [];

  for (const line of lines.slice(1)) {
    const cols = line.split(",");
    const lat = num(cols[idx("latitude")]);
    const lon = num(cols[idx("longitude")]);
    if (lat === null || lon === null) continue;
    const brightTi4 = num(cols[idx("bright_ti4")]) ?? num(cols[idx("brightness")]);
    const brightTi5 = num(cols[idx("bright_ti5")]) ?? num(cols[idx("bright_t31")]);
    out.push({
      latitude: lat,
      longitude: lon,
      acq_date: cols[idx("acq_date")]?.trim() ?? "",
      acq_time: cols[idx("acq_time")]?.trim() ?? "",
      satellite: cols[idx("satellite")]?.trim() ?? "",
      instrument: cols[idx("instrument")]?.trim() ?? "",
      confidence: cols[idx("confidence")]?.trim() ?? "",
      frp: num(cols[idx("frp")]) ?? 0,
      bright_ti4: brightTi4,
      bright_ti5: brightTi5,
      daynight: cols[idx("daynight")]?.trim() ?? "",
      scan: num(cols[idx("scan")]),
      track: num(cols[idx("track")]),
      product: source,
    });
  }
  return out;
}

export const Route = createFileRoute("/api/firms/hotspots")({
  server: {
    handlers: {
      GET: async () => {
        const key = process.env["NASA_FIRMS_MAP_KEY"];
        if (!key) {
          return Response.json(
            { available: false, reason: "NOT_CONFIGURED", observations: [] },
            { status: 200 },
          );
        }

        if (cache && Date.now() - cache.at < CACHE_MS) {
          return Response.json({ available: true, cached: true, ...cache.payload });
        }

        const observations: FirmsObservation[] = [];
        const used: string[] = [];

        for (const source of SOURCES) {
          // MODIS is only a fallback: skip it when VIIRS already returned data.
          if (source === "MODIS_NRT" && observations.length > 0) continue;
          try {
            const url = `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${key}/${source}/${INDIA_BBOX}/${DAY_RANGE}`;
            const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
            if (!res.ok) continue;
            const text = await res.text();
            if (text.toLowerCase().includes("invalid") && text.length < 400) continue;
            const rows = parseCsv(text, source);
            if (rows.length > 0) {
              observations.push(...rows);
              used.push(source);
            }
          } catch {
            // Never surface upstream error detail — it can echo the request URL.
            continue;
          }
        }

        if (observations.length === 0) {
          return Response.json(
            { available: false, reason: "NO_DATA", observations: [] },
            { status: 200 },
          );
        }

        cache = {
          at: Date.now(),
          payload: { observations, sources: used, fetchedAt: new Date().toISOString() },
        };
        return Response.json({ available: true, cached: false, ...cache.payload });
      },
    },
  },
});
