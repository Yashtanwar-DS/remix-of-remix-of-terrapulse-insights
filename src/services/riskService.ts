import type { RiskLevel, ThermalEvent } from "@/types";
import { riskLevel } from "@/utils/labels";

export function eventRiskLevel(event: ThermalEvent): RiskLevel {
  return riskLevel(event.riskScore);
}

export function escalation(level: RiskLevel) {
  switch (level) {
    case "HIGH":
      return { label: "Immediate attention", detail: "Escalate for field verification now." };
    case "MEDIUM":
      return { label: "Review required", detail: "Assign an analyst for context review." };
    default:
      return { label: "Monitor", detail: "Keep under routine satellite monitoring." };
  }
}

export function prioritise(events: ThermalEvent[]) {
  return [...events].sort((a, b) => b.riskScore - a.riskScore);
}
