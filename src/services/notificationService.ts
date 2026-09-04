import type { ThermalEvent } from "@/types";
import { eventRiskLevel } from "./riskService";

/**
 * Notification abstraction. The MVP only dispatches in-app notifications.
 * FCM / email / SMS transports can be registered here later.
 */
export type Channel = "IN_APP" | "EMAIL" | "SMS" | "PUSH";

export interface NotificationPayload {
  eventId: string;
  title: string;
  body: string;
  level: "HIGH" | "MEDIUM" | "LOW";
}

const enabledChannels: Channel[] = ["IN_APP"];

export function channelStatus() {
  return [
    { channel: "IN_APP" as Channel, enabled: true, note: "Active in MVP" },
    { channel: "EMAIL" as Channel, enabled: false, note: "Integration point ready" },
    { channel: "SMS" as Channel, enabled: false, note: "Integration point ready" },
    { channel: "PUSH" as Channel, enabled: false, note: "FCM integration point ready" },
  ];
}

export function buildNotification(event: ThermalEvent): NotificationPayload {
  const level = eventRiskLevel(event);
  return {
    eventId: event.id,
    title: `${level} RISK — ${event.id}`,
    body: `Prototype classification with ${(event.confidence * 100).toFixed(0)}% confidence. Human verification required.`,
    level,
  };
}

export function dispatch(payload: NotificationPayload): { delivered: Channel[] } {
  // No external messages are sent in the MVP.
  return { delivered: enabledChannels.filter(() => Boolean(payload)) };
}
