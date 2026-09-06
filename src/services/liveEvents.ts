import { classifyThermalEvent } from "@/services/classificationService";
import { computeRiskScore } from "@/services/classificationService";
import { findNearestFacility } from "@/services/osmService";
import type { Detection, ThermalEvent } from "@/types";

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

/** Facility context is only claimed when a mapped facility is genuinely close. */
const FACILITY_CONTEXT_RADIUS_M = 5000;
/** Observations within ~1 km of each other are treated as one thermal source. */
const CLUSTER_TOLERANCE_DEG = 0.01;

function observationTime(o: FirmsObservation): string {
  const t = o.acq_time.padStart(4, "0");
  const iso = `${o.acq_date}T${t.slice(0, 2)}:${t.slice(2, 4)}:00Z`;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

function firmsConfidence(raw: string): number {
  const n = Number(raw);
  if (Number.isFinite(n)) return Math.max(0, Math.min(1, n / 100));
  switch (raw.toLowerCase()) {
    case "h":
      return 0.8;
    case "n":
      return 0.5;
    case "l":
      return 0.3;
    default:
      return 0.5;
  }
}

function sensorLabel(o: FirmsObservation): string {
  const sat = o.satellite || "";
  const inst = o.instrument || "";
  return [inst, sat].filter(Boolean).join(" ") || o.product;
}

export function buildLiveEvents(observations: FirmsObservation[]): ThermalEvent[] {
  const clusters = new Map<string, FirmsObservation[]>();
  for (const o of observations) {
    const key = `${Math.round(o.latitude / CLUSTER_TOLERANCE_DEG)}:${Math.round(o.longitude / CLUSTER_TOLERANCE_DEG)}`;
    const bucket = clusters.get(key);
    if (bucket) bucket.push(o);
    else clusters.set(key, [o]);
  }

  const events: ThermalEvent[] = [];
  let seq = 0;

  for (const group of clusters.values()) {
    const sorted = [...group].sort(
      (a, b) => new Date(observationTime(a)).getTime() - new Date(observationTime(b)).getTime(),
    );
    const latest = sorted[sorted.length - 1]!;
    const latitude = sorted.reduce((s, o) => s + o.latitude, 0) / sorted.length;
    const longitude = sorted.reduce((s, o) => s + o.longitude, 0) / sorted.length;

    const history: Detection[] = sorted.map((o) => ({
      timestamp: observationTime(o),
      frp: Number(o.frp.toFixed(1)),
      brightnessTemperature: Math.round(o.bright_ti4 ?? 0),
    }));

    const activeDays = new Set(sorted.map((o) => o.acq_date)).size;
    const persistenceCount = sorted.length;
    const persistenceKnown = activeDays > 1;

    const match = findNearestFacility({ latitude, longitude });
    const contextAvailable = Boolean(match && match.distance <= FACILITY_CONTEXT_RADIUS_M);
    const facilityDistance = contextAvailable ? Math.round(match!.distance) : -1;

    const frp = Number(latest.frp.toFixed(1));
    const brightnessTemperature = Math.round(latest.bright_ti4 ?? 0);
    const observedConfidence = firmsConfidence(latest.confidence);

    let probableClass: ThermalEvent["probableClass"] = "UNCLASSIFIED";
    let confidence = observedConfidence;
    let probabilities: ThermalEvent["probabilities"] = [
      { probableClass: "UNCLASSIFIED", probability: 1 },
    ];
    let explanationFactors: ThermalEvent["explanationFactors"] = [
      {
        factor: "Raw FIRMS thermal anomaly",
        detail:
          "No supporting geographic or temporal context yet — displayed as an unclassified thermal anomaly.",
        weight: 0.3,
      },
      {
        factor: "Thermal intensity (FRP)",
        detail: `${frp} MW radiative power reported by ${sensorLabel(latest)}`,
        weight: Math.min(frp / 60, 1),
      },
    ];

    // Only run the prototype classifier when there is real supporting context.
    if (contextAvailable || persistenceKnown) {
      const result = classifyThermalEvent({
        frp,
        brightnessTemperature,
        facilityDistance: contextAvailable ? facilityDistance : 1_000_000,
        facilityType: contextAvailable ? match!.facility.type : "Other",
        persistenceCount,
        observationWindowDays: Math.max(activeDays, 1),
        landCover: contextAvailable ? "Industrial" : "Barren",
        spatiallyExpanding: false,
      });
      probableClass = result.probableClass;
      confidence = result.confidence;
      probabilities = result.probabilities;
      explanationFactors = result.explanationFactors;
    }

    const riskScore = computeRiskScore({
      frp,
      brightnessTemperature,
      facilityDistance: contextAvailable ? facilityDistance : 1_000_000,
      facilityType: contextAvailable ? match!.facility.type : "Other",
      persistenceCount,
      observationWindowDays: Math.max(activeDays, 1),
      landCover: contextAvailable ? "Industrial" : "Barren",
      spatiallyExpanding: false,
      confidence,
    });

    seq += 1;
    events.push({
      id: `FIRMS-${String(seq).padStart(4, "0")}`,
      latitude,
      longitude,
      timestamp: observationTime(latest),
      frp,
      brightnessTemperature,
      sensor: sensorLabel(latest),
      region: "India",
      probableClass,
      confidence,
      riskScore,
      persistenceCount,
      observationWindowDays: Math.max(activeDays, 1),
      activeDays,
      landCover: "Barren",
      landCoverKnown: false,
      facilityType: contextAvailable ? match!.facility.type : "Other",
      facilityName: contextAvailable ? match!.facility.name : "",
      facilityDistance,
      contextAvailable,
      persistenceKnown,
      lastDetected: observationTime(latest),
      verificationStatus: "REQUIRES_VERIFICATION",
      nearbyRoad: "",
      nearbySettlement: "",
      history,
      auditLog: [{ at: new Date().toISOString(), action: "Ingested from NASA FIRMS" }],
      spatiallyExpanding: false,
      probabilities,
      explanationFactors,
      source: "LIVE",
      firms: {
        acqDate: latest.acq_date,
        acqTime: latest.acq_time,
        satellite: latest.satellite,
        instrument: latest.instrument,
        confidence: latest.confidence,
        daynight: latest.daynight,
        scan: latest.scan,
        track: latest.track,
        product: latest.product,
        brightTi4: latest.bright_ti4,
        brightTi5: latest.bright_ti5,
      },
    });
  }

  return events.sort((a, b) => b.riskScore - a.riskScore).slice(0, 400);
}
