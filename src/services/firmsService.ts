import { buildDemoEvents } from "@/data/events";
import type { ThermalEvent } from "@/types";

/**
 * NASA FIRMS data service.
 *
 * Credentials are never hardcoded. When no FIRMS map key is configured the
 * service transparently falls back to the bundled demo dataset so the app
 * deploys and runs without any external service.
 */
export type DataMode = "LIVE" | "DEMO";

export function firmsConfigured(): boolean {
  return Boolean(import.meta.env["VITE_FIRMS_ENABLED"] === "true");
}

export function firmsMode(): DataMode {
  return firmsConfigured() ? "LIVE" : "DEMO";
}

export interface FetchResult {
  mode: DataMode;
  fetchedAt: string;
  events: ThermalEvent[];
}

export async function fetchThermalEvents(): Promise<FetchResult> {
  if (firmsConfigured()) {
    try {
      // Real integration point: a server function proxies the FIRMS CSV/API
      // using a server-side key, then maps rows into ThermalEvent objects.
      const res = await fetch("/api/public/firms");
      if (res.ok) {
        const events = (await res.json()) as ThermalEvent[];
        return { mode: "LIVE", fetchedAt: new Date().toISOString(), events };
      }
    } catch {
      // fall through to demo mode
    }
  }
  return {
    mode: "DEMO",
    fetchedAt: new Date().toISOString(),
    events: buildDemoEvents(new Date()),
  };
}
