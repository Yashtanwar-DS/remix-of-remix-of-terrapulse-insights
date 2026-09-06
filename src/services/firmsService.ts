import { buildDemoEvents } from "@/data/events";
import { buildLiveEvents, type FirmsObservation } from "@/services/liveEvents";
import type { ThermalEvent } from "@/types";

/**
 * NASA FIRMS data service.
 *
 * The FIRMS map key lives only in the server environment. The browser calls
 * our own `/api/firms/hotspots` endpoint, never NASA directly. When live data
 * cannot be loaded the bundled sample dataset is used as a graceful fallback.
 */
export type DataMode = "LIVE" | "SAMPLE";

export interface FetchResult {
  mode: DataMode;
  fetchedAt: string;
  events: ThermalEvent[];
  /** Present only when the live feed could not be used. */
  notice?: string;
  sources?: string[];
}

function sampleResult(notice?: string): FetchResult {
  const events = buildDemoEvents(new Date()).map((e) => ({ ...e, source: "SAMPLE" as const }));
  return { mode: "SAMPLE", fetchedAt: new Date().toISOString(), events, ...(notice ? { notice } : {}) };
}

export async function fetchThermalEvents(): Promise<FetchResult> {
  try {
    const res = await fetch("/api/firms/hotspots");
    if (!res.ok) return sampleResult("Unable to fetch latest FIRMS data. Showing available sample data.");
    const payload = (await res.json()) as {
      available: boolean;
      observations: FirmsObservation[];
      sources?: string[];
      fetchedAt?: string;
    };
    if (!payload.available || !payload.observations?.length) {
      return sampleResult("Unable to fetch latest FIRMS data. Showing available sample data.");
    }
    const events = buildLiveEvents(payload.observations);
    if (events.length === 0) {
      return sampleResult("Unable to fetch latest FIRMS data. Showing available sample data.");
    }
    return {
      mode: "LIVE",
      fetchedAt: payload.fetchedAt ?? new Date().toISOString(),
      events,
      ...(payload.sources ? { sources: payload.sources } : {}),
    };
  } catch {
    return sampleResult("Unable to fetch latest FIRMS data. Showing available sample data.");
  }
}
