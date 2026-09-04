import type { ClassificationResult, ProbableClass, ThermalEvent } from "@/types";

export interface ClassificationInput {
  frp: number;
  brightnessTemperature: number;
  facilityDistance: number;
  facilityType: ThermalEvent["facilityType"];
  persistenceCount: number;
  observationWindowDays: number;
  landCover: ThermalEvent["landCover"];
  spatiallyExpanding: boolean;
}

/**
 * Prototype AI classification engine.
 *
 * Deterministic, feature-based scoring — NOT a model trained on labelled data.
 * The interface is intentionally narrow so a real XGBoost / Random Forest
 * service can replace the internals without any UI change.
 */
export function classifyThermalEvent(input: ClassificationInput): ClassificationResult {
  const {
    frp,
    brightnessTemperature,
    facilityDistance,
    facilityType,
    persistenceCount,
    observationWindowDays,
    landCover,
    spatiallyExpanding,
  } = input;

  const nearIndustrial = facilityDistance < 1500;
  const recurrence = persistenceCount / Math.max(observationWindowDays, 1);
  const scores: Record<ProbableClass, number> = {
    INDUSTRIAL_FIRE: 0.05,
    GAS_FLARE: 0.05,
    PERSISTENT_INDUSTRIAL_HEAT: 0.05,
    AGRICULTURAL_BURNING: 0.05,
    WILDFIRE: 0.05,
    UNCLASSIFIED: 0.12,
  };

  // Thermal intensity
  if (frp >= 30) scores.INDUSTRIAL_FIRE += 0.35;
  else if (frp >= 15) scores.INDUSTRIAL_FIRE += 0.15;
  if (brightnessTemperature >= 330) scores.INDUSTRIAL_FIRE += 0.1;

  // Geographic context
  if (nearIndustrial) {
    scores.INDUSTRIAL_FIRE += 0.25;
    scores.PERSISTENT_INDUSTRIAL_HEAT += 0.2;
    scores.AGRICULTURAL_BURNING -= 0.03;
    if (facilityType === "Oil & Gas" || facilityType === "Refinery") {
      scores.GAS_FLARE += 0.3;
    }
  } else {
    scores.UNCLASSIFIED += 0.1;
  }

  // Temporal recurrence
  if (persistenceCount >= 4) {
    scores.PERSISTENT_INDUSTRIAL_HEAT += 0.35;
    scores.GAS_FLARE += 0.2;
    scores.AGRICULTURAL_BURNING -= 0.05;
  } else if (persistenceCount >= 2) {
    scores.PERSISTENT_INDUSTRIAL_HEAT += 0.12;
    scores.INDUSTRIAL_FIRE += 0.08;
  } else {
    scores.AGRICULTURAL_BURNING += 0.15;
    scores.WILDFIRE += 0.1;
  }
  if (recurrence > 0.7) scores.GAS_FLARE += 0.12;

  // Land-cover context
  if (landCover === "Agricultural") {
    scores.AGRICULTURAL_BURNING += 0.45;
    scores.INDUSTRIAL_FIRE -= 0.1;
  }
  if (landCover === "Forest") {
    scores.WILDFIRE += 0.4;
    if (spatiallyExpanding) scores.WILDFIRE += 0.2;
  }
  if (landCover === "Industrial") {
    scores.INDUSTRIAL_FIRE += 0.15;
    scores.PERSISTENT_INDUSTRIAL_HEAT += 0.15;
  }

  const entries = (Object.keys(scores) as ProbableClass[]).map((k) => ({
    probableClass: k,
    raw: Math.max(scores[k], 0.01),
  }));
  const total = entries.reduce((s, e) => s + e.raw, 0);
  const probabilities = entries
    .map((e) => ({ probableClass: e.probableClass, probability: e.raw / total }))
    .sort((a, b) => b.probability - a.probability);

  const top = probabilities[0]!;
  const riskScore = computeRiskScore({ ...input, confidence: top.probability });

  const explanationFactors = [
    {
      factor: "Thermal intensity (FRP)",
      detail: `${frp.toFixed(1)} MW radiative power, ${brightnessTemperature} K brightness temperature`,
      weight: Math.min(frp / 60, 1),
    },
    {
      factor: "Distance to industrial facility",
      detail: nearIndustrial
        ? `${Math.round(facilityDistance)} m from a ${facilityType.toLowerCase()}`
        : `${(facilityDistance / 1000).toFixed(1)} km from the nearest mapped facility`,
      weight: Math.max(0, 1 - facilityDistance / 5000),
    },
    {
      factor: "Temporal recurrence",
      detail: `${persistenceCount} detection(s) in a ${observationWindowDays}-day window`,
      weight: Math.min(persistenceCount / 6, 1),
    },
    {
      factor: "Land-cover context",
      detail: `${landCover} land cover at the detection footprint`,
      weight: landCover === "Industrial" || landCover === "Agricultural" || landCover === "Forest" ? 0.7 : 0.3,
    },
    {
      factor: "Satellite context",
      detail: spatiallyExpanding
        ? "Detection footprint expanding across consecutive overpasses"
        : "Detection footprint stable across overpasses",
      weight: spatiallyExpanding ? 0.6 : 0.35,
    },
  ];

  return {
    probableClass: top.probableClass,
    confidence: Number(top.probability.toFixed(4)),
    riskScore,
    probabilities,
    explanationFactors,
  };
}

export function computeRiskScore(
  input: ClassificationInput & { confidence: number },
): number {
  const intensity = Math.min(input.frp / 60, 1) * 30;
  const proximity = Math.max(0, 1 - input.facilityDistance / 5000) * 25;
  const persistence = Math.min(input.persistenceCount / 6, 1) * 20;
  const context =
    (input.landCover === "Industrial" ? 1 : input.landCover === "Forest" ? 0.7 : 0.4) * 15;
  const conf = input.confidence * 10;
  return Math.max(0, Math.min(100, Math.round(intensity + proximity + persistence + context + conf)));
}
