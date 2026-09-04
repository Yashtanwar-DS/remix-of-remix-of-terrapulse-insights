import type {
  ProbableClass,
  RiskLevel,
  VerificationStatus,
  PersistenceBand,
} from "@/types";

export const CLASS_LABELS: Record<ProbableClass, string> = {
  INDUSTRIAL_FIRE: "Possible Industrial Fire",
  GAS_FLARE: "Possible Gas Flare",
  PERSISTENT_INDUSTRIAL_HEAT: "Persistent Thermal Source",
  AGRICULTURAL_BURNING: "Possible Agricultural Burning",
  WILDFIRE: "Possible Wildfire",
  UNCLASSIFIED: "Unclassified Thermal Anomaly",
};

export const ALL_CLASSES: ProbableClass[] = [
  "INDUSTRIAL_FIRE",
  "GAS_FLARE",
  "PERSISTENT_INDUSTRIAL_HEAT",
  "AGRICULTURAL_BURNING",
  "WILDFIRE",
  "UNCLASSIFIED",
];

export const STATUS_LABELS: Record<VerificationStatus, string> = {
  REQUIRES_VERIFICATION: "Requires Verification",
  HUMAN_VERIFIED: "Human Verified",
  DISMISSED: "Dismissed",
  NEEDS_REVIEW: "Needs Further Review",
};

export function riskLevel(score: number): RiskLevel {
  if (score >= 80) return "HIGH";
  if (score >= 50) return "MEDIUM";
  return "LOW";
}

export function persistenceBand(count: number): PersistenceBand {
  if (count <= 1) return "Single detection";
  if (count <= 3) return "Repeated";
  return "Persistent";
}

export function confidenceBand(c: number): "HIGH" | "MEDIUM" | "LOW" {
  if (c > 0.8) return "HIGH";
  if (c >= 0.6) return "MEDIUM";
  return "LOW";
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }) + " UTC";
}

export function formatDistance(m: number) {
  return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`;
}

export const CLASS_COLOR: Record<ProbableClass, string> = {
  INDUSTRIAL_FIRE: "#dc2626",
  GAS_FLARE: "#ea580c",
  PERSISTENT_INDUSTRIAL_HEAT: "#d97706",
  AGRICULTURAL_BURNING: "#16a34a",
  WILDFIRE: "#7c3aed",
  UNCLASSIFIED: "#64748b",
};

export const RISK_COLOR: Record<RiskLevel, string> = {
  HIGH: "#dc2626",
  MEDIUM: "#d97706",
  LOW: "#2563eb",
};
