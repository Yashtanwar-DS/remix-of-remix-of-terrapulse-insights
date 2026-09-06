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

export interface FirmsMeta {
  acqDate: string;
  acqTime: string;
  satellite: string;
  instrument: string;
  confidence: string;
  daynight: string;
  scan: number | null;
  track: number | null;
  product: string;
  brightTi4: number | null;
  brightTi5: number | null;
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
  facilityDistance: number; // metres, -1 when no context is available
  verificationStatus: VerificationStatus;
  nearbyRoad: string;
  nearbySettlement: string;
  history: Detection[];
  auditLog: { at: string; action: string }[];
  spatiallyExpanding: boolean;
  probabilities: { probableClass: ProbableClass; probability: number }[];
  explanationFactors: { factor: string; detail: string; weight: number }[];
  /** Live FIRMS observations vs bundled sample data. */
  source?: "LIVE" | "SAMPLE";
  /** False when no mapped facility is close enough to claim context. */
  contextAvailable?: boolean;
  landCoverKnown?: boolean;
  persistenceKnown?: boolean;
  lastDetected?: string;
  firms?: FirmsMeta;
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
