import type { Detection, ThermalEvent } from "@/types";
import { findNearestFacility } from "@/services/osmService";
import { classifyThermalEvent } from "@/services/classificationService";

type Seed = {
  id: string;
  latitude: number;
  longitude: number;
  hoursAgo: number;
  frp: number;
  bt: number;
  sensor: string;
  region: string;
  persistenceCount: number;
  landCover: ThermalEvent["landCover"];
  verificationStatus?: ThermalEvent["verificationStatus"];
  road: string;
  settlement: string;
  expanding?: boolean;
};

// DEMO DATA — synthetic coordinates for prototype demonstration only.
// These do NOT represent actual current fires or confirmed incidents.
const SEEDS: Seed[] = [
  // --- Industrial-fire-like (Gujarat / Maharashtra / Odisha) ---
  { id: "TP-1042", latitude: 22.3512, longitude: 70.0603, hoursAgo: 6, frp: 45, bt: 331, sensor: "VIIRS S-NPP", region: "Gujarat", persistenceCount: 3, landCover: "Industrial", road: "SH-25 Jamnagar Bypass", settlement: "Sikka (4.2 km)" },
  { id: "TP-1043", latitude: 21.1129, longitude: 72.6551, hoursAgo: 11, frp: 52, bt: 338, sensor: "VIIRS NOAA-20", region: "Gujarat", persistenceCount: 2, landCover: "Industrial", road: "Hazira Port Road", settlement: "Hazira (2.1 km)" },
  { id: "TP-1044", latitude: 19.0041, longitude: 72.9037, hoursAgo: 20, frp: 38, bt: 329, sensor: "MODIS Aqua", region: "Maharashtra", persistenceCount: 3, landCover: "Industrial", road: "Mahul Road", settlement: "Chembur (3.0 km)" },
  { id: "TP-1045", latitude: 20.8412, longitude: 85.1041, hoursAgo: 30, frp: 61, bt: 344, sensor: "VIIRS S-NPP", region: "Odisha", persistenceCount: 2, landCover: "Industrial", road: "NH-55", settlement: "Angul (6.4 km)" },
  { id: "TP-1046", latitude: 23.6710, longitude: 86.1533, hoursAgo: 42, frp: 41, bt: 333, sensor: "VIIRS NOAA-20", region: "Jharkhand", persistenceCount: 3, landCover: "Industrial", road: "Bokaro Steel City Ring Road", settlement: "Bokaro (5.1 km)" },

  // --- Gas-flare-like (near refineries / oil & gas, high recurrence) ---
  { id: "TP-1047", latitude: 22.4559, longitude: 69.7139, hoursAgo: 4, frp: 22, bt: 322, sensor: "VIIRS S-NPP", region: "Gujarat", persistenceCount: 6, landCover: "Industrial", road: "Vadinar Terminal Road", settlement: "Vadinar (3.6 km)" },
  { id: "TP-1048", latitude: 23.0341, longitude: 70.2181, hoursAgo: 9, frp: 18, bt: 318, sensor: "VIIRS NOAA-20", region: "Gujarat", persistenceCount: 7, landCover: "Industrial", road: "Kandla Port Road", settlement: "Gandhidham (9.8 km)" },
  { id: "TP-1049", latitude: 27.3944, longitude: 95.6201, hoursAgo: 14, frp: 16, bt: 315, sensor: "VIIRS S-NPP", region: "Assam", persistenceCount: 6, landCover: "Industrial", road: "NH-315", settlement: "Digboi (1.4 km)" },
  { id: "TP-1050", latitude: 26.6247, longitude: 93.7429, hoursAgo: 26, frp: 20, bt: 320, sensor: "MODIS Terra", region: "Assam", persistenceCount: 5, landCover: "Industrial", road: "NH-37", settlement: "Numaligarh (2.9 km)" },
  { id: "TP-1051", latitude: 18.5389, longitude: 73.1436, hoursAgo: 33, frp: 24, bt: 324, sensor: "VIIRS NOAA-20", region: "Maharashtra", persistenceCount: 6, landCover: "Industrial", road: "Nagothane Link Road", settlement: "Nagothane (2.2 km)" },

  // --- Persistent thermal sources (power plants, mining) ---
  { id: "TP-1052", latitude: 22.3603, longitude: 82.6981, hoursAgo: 7, frp: 14, bt: 312, sensor: "VIIRS S-NPP", region: "Chhattisgarh", persistenceCount: 7, landCover: "Industrial", road: "Korba-Champa Road", settlement: "Korba (4.8 km)" },
  { id: "TP-1053", latitude: 20.9471, longitude: 85.2189, hoursAgo: 16, frp: 12, bt: 309, sensor: "MODIS Aqua", region: "Odisha", persistenceCount: 6, landCover: "Barren", road: "Talcher Colliery Road", settlement: "Talcher (5.5 km)" },
  { id: "TP-1054", latitude: 23.7419, longitude: 86.4152, hoursAgo: 22, frp: 17, bt: 316, sensor: "VIIRS NOAA-20", region: "Jharkhand", persistenceCount: 8, landCover: "Barren", road: "Jharia Coalfield Road", settlement: "Jharia (1.8 km)" },
  { id: "TP-1055", latitude: 24.1039, longitude: 82.6733, hoursAgo: 38, frp: 15, bt: 313, sensor: "VIIRS S-NPP", region: "Madhya Pradesh", persistenceCount: 7, landCover: "Industrial", road: "NH-39 Singrauli", settlement: "Waidhan (7.3 km)" },
  { id: "TP-1056", latitude: 19.9968, longitude: 79.2821, hoursAgo: 45, frp: 13, bt: 310, sensor: "MODIS Terra", region: "Maharashtra", persistenceCount: 5, landCover: "Industrial", road: "Chandrapur-Ballarpur Road", settlement: "Chandrapur (6.9 km)" },

  // --- Agricultural burning (Punjab / MP) ---
  { id: "TP-1057", latitude: 30.4521, longitude: 75.3812, hoursAgo: 5, frp: 9, bt: 305, sensor: "VIIRS S-NPP", region: "Punjab", persistenceCount: 1, landCover: "Agricultural", road: "NH-7 Barnala Road", settlement: "Barnala (5.6 km)" },
  { id: "TP-1058", latitude: 30.8912, longitude: 75.7601, hoursAgo: 13, frp: 7, bt: 303, sensor: "MODIS Aqua", region: "Punjab", persistenceCount: 1, landCover: "Agricultural", road: "Ludhiana Rural Link Road", settlement: "Jagraon (8.2 km)" },
  { id: "TP-1059", latitude: 31.2049, longitude: 74.9412, hoursAgo: 24, frp: 11, bt: 307, sensor: "VIIRS NOAA-20", region: "Punjab", persistenceCount: 2, landCover: "Agricultural", road: "Amritsar Bypass", settlement: "Tarn Taran (11.0 km)" },
  { id: "TP-1060", latitude: 23.4512, longitude: 76.8912, hoursAgo: 31, frp: 8, bt: 304, sensor: "VIIRS S-NPP", region: "Madhya Pradesh", persistenceCount: 1, landCover: "Agricultural", road: "SH-18", settlement: "Ashta (9.4 km)" },

  // --- Wildfire-like (forest, expanding) ---
  { id: "TP-1061", latitude: 21.7423, longitude: 82.0912, hoursAgo: 8, frp: 33, bt: 327, sensor: "VIIRS NOAA-20", region: "Chhattisgarh", persistenceCount: 2, landCover: "Forest", road: "Forest Track FR-12", settlement: "Kawardha (14.2 km)", expanding: true },
  { id: "TP-1062", latitude: 26.1201, longitude: 92.3418, hoursAgo: 19, frp: 27, bt: 323, sensor: "MODIS Terra", region: "Assam", persistenceCount: 1, landCover: "Forest", road: "NH-27 Service Road", settlement: "Nagaon (17.6 km)", expanding: true },
  { id: "TP-1063", latitude: 22.9812, longitude: 79.4123, hoursAgo: 40, frp: 30, bt: 325, sensor: "VIIRS S-NPP", region: "Madhya Pradesh", persistenceCount: 2, landCover: "Forest", road: "Kanha Buffer Road", settlement: "Mandla (21.3 km)", expanding: true },

  // --- Unclassified / ambiguous ---
  { id: "TP-1064", latitude: 24.8912, longitude: 87.1123, hoursAgo: 12, frp: 6, bt: 301, sensor: "MODIS Aqua", region: "Jharkhand", persistenceCount: 1, landCover: "Grassland", road: "District Road 44", settlement: "Sahibganj (13.1 km)" },
  { id: "TP-1065", latitude: 20.1123, longitude: 84.2312, hoursAgo: 18, frp: 5, bt: 300, sensor: "VIIRS NOAA-20", region: "Odisha", persistenceCount: 1, landCover: "Grassland", road: "SH-21", settlement: "Boudh (16.9 km)" },
  { id: "TP-1066", latitude: 21.9812, longitude: 76.1123, hoursAgo: 27, frp: 10, bt: 306, sensor: "VIIRS S-NPP", region: "Madhya Pradesh", persistenceCount: 2, landCover: "Barren", road: "Khandwa Rural Road", settlement: "Khandwa (12.4 km)" },
  { id: "TP-1067", latitude: 18.9123, longitude: 76.5412, hoursAgo: 35, frp: 4, bt: 299, sensor: "MODIS Terra", region: "Maharashtra", persistenceCount: 1, landCover: "Grassland", road: "SH-156", settlement: "Latur (19.7 km)" },
  { id: "TP-1068", latitude: 22.6068, longitude: 75.6871, hoursAgo: 3, frp: 29, bt: 326, sensor: "VIIRS S-NPP", region: "Madhya Pradesh", persistenceCount: 3, landCover: "Industrial", road: "Pithampur Sector Road", settlement: "Pithampur (2.4 km)" },
  { id: "TP-1069", latitude: 21.1951, longitude: 81.3527, hoursAgo: 21, frp: 36, bt: 330, sensor: "VIIRS NOAA-20", region: "Chhattisgarh", persistenceCount: 4, landCover: "Industrial", road: "Bhilai Plant Road", settlement: "Bhilai (3.3 km)" },
  { id: "TP-1070", latitude: 30.0206, longitude: 74.8511, hoursAgo: 29, frp: 19, bt: 319, sensor: "MODIS Aqua", region: "Punjab", persistenceCount: 5, landCover: "Industrial", road: "Bathinda Refinery Road", settlement: "Bathinda (8.7 km)" },
];

const OBSERVATION_WINDOW_DAYS = 7;

function buildHistory(seed: Seed, base: Date): Detection[] {
  const out: Detection[] = [];
  for (let i = seed.persistenceCount - 1; i >= 0; i--) {
    const t = new Date(base.getTime() - i * 1.6 * 24 * 3600 * 1000);
    const jitter = ((seed.id.charCodeAt(4) + i * 7) % 11) / 10 - 0.5;
    out.push({
      timestamp: t.toISOString(),
      frp: Number(Math.max(1, seed.frp * (0.75 + i * 0.06) + jitter * 3).toFixed(1)),
      brightnessTemperature: Math.round(seed.bt - i * 2 + jitter * 2),
    });
  }
  return out;
}

export function buildDemoEvents(now: Date = new Date()): ThermalEvent[] {
  return SEEDS.map((seed) => {
    const detectedAt = new Date(now.getTime() - seed.hoursAgo * 3600 * 1000);
    const match = findNearestFacility(seed)!;
    const activeDays = new Set(
      buildHistory(seed, detectedAt).map((d) => d.timestamp.slice(0, 10)),
    ).size;

    const classification = classifyThermalEvent({
      frp: seed.frp,
      brightnessTemperature: seed.bt,
      facilityDistance: match.distance,
      facilityType: match.facility.type,
      persistenceCount: seed.persistenceCount,
      observationWindowDays: OBSERVATION_WINDOW_DAYS,
      landCover: seed.landCover,
      spatiallyExpanding: seed.expanding ?? false,
    });

    return {
      id: seed.id,
      latitude: seed.latitude,
      longitude: seed.longitude,
      timestamp: detectedAt.toISOString(),
      frp: seed.frp,
      brightnessTemperature: seed.bt,
      sensor: seed.sensor,
      region: seed.region,
      probableClass: classification.probableClass,
      confidence: classification.confidence,
      riskScore: classification.riskScore,
      persistenceCount: seed.persistenceCount,
      observationWindowDays: OBSERVATION_WINDOW_DAYS,
      activeDays,
      landCover: seed.landCover,
      facilityType: match.facility.type,
      facilityName: match.facility.name,
      facilityDistance: Math.round(match.distance),
      verificationStatus: seed.verificationStatus ?? "REQUIRES_VERIFICATION",
      nearbyRoad: seed.road,
      nearbySettlement: seed.settlement,
      history: buildHistory(seed, detectedAt),
      auditLog: [
        { at: detectedAt.toISOString(), action: "Thermal anomaly ingested from demo dataset" },
      ],
      spatiallyExpanding: seed.expanding ?? false,
    } satisfies ThermalEvent;
  });
}
