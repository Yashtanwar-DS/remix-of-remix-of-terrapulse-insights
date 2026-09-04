export type ProbableClass =
  | "INDUSTRIAL_FIRE"
  | "GAS_FLARE"
  | "PERSISTENT_INDUSTRIAL_HEAT"
  | "AGRICULTURAL_BURNING"
  | "WILDFIRE"
  | "UNCLASSIFIED";

export type RiskLevel = "HIGH" | "MEDIUM" | "LOW";

export type VerificationStatus =
  | "REQUIRES_VERIFICATION"
  | "HUMAN_VERIFIED"
  | "DISMISSED"
  | "NEEDS_REVIEW";

export type FacilityType =
  | "Refinery"
  | "Power Plant"
  | "Factory"
  | "Mining"
  | "Oil & Gas"
  | "Industrial Area"
  | "Other";

export type LandCover =
  | "Industrial"
  | "Agricultural"
  | "Forest"
  | "Urban"
  | "Barren"
  | "Grassland";

export type PersistenceBand = "Single detection" | "Repeated" | "Persistent";

export interface Facility {
  id: string;
  name: string;
  type: FacilityType;
  latitude: number;
  longitude: number;
}

export interface Detection {
  timestamp: string;
  frp: number;
  brightnessTemperature: number;
}

export interface ThermalEvent {
  id: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  frp: number;
  brightnessTemperature: number;
  sensor: string;
  region: string;
  probableClass: ProbableClass;
  confidence: number;
  riskScore: number;
  persistenceCount: number;
  observationWindowDays: number;
  activeDays: number;
  landCover: LandCover;
  facilityType: FacilityType;
  facilityName: string;
  facilityDistance: number; // metres
  verificationStatus: VerificationStatus;
  nearbyRoad: string;
  nearbySettlement: string;
  history: Detection[];
  auditLog: { at: string; action: string }[];
  spatiallyExpanding: boolean;
}

export interface ClassificationResult {
  probableClass: ProbableClass;
  confidence: number;
  riskScore: number;
  probabilities: { probableClass: ProbableClass; probability: number }[];
  explanationFactors: { factor: string; detail: string; weight: number }[];
}

export interface EventFilters {
  search: string;
  from: string;
  to: string;
  risk: RiskLevel[];
  classes: ProbableClass[];
  confidence: ("HIGH" | "MEDIUM" | "LOW")[];
  persistence: PersistenceBand[];
  facilityTypes: FacilityType[];
  verification: VerificationStatus[];
}
