import type { WifiNodeHealth } from "./types";
import { logger } from "@core-kernel/log";

export async function fetchWifiMeshHealth(): Promise<WifiNodeHealth[]> {
  logger.info("Fetching WiFi mesh health", {
    module: "territorial-sensing",
    federation: "connectivity",
  });

  const now = new Date().toISOString();
  return [
    {
      id: "node-minero-01",
      location: { lat: 20.1368, lon: -98.6723 },
      signalStrengthDbm: -58,
      uptimePct: 99.2,
      packetLossPct: 0.5,
      backhaulLatencyMs: 18,
      status: "online",
      ts: now,
    },
    {
      id: "node-barrio-alto",
      location: { lat: 20.1401, lon: -98.6701 },
      signalStrengthDbm: -72,
      uptimePct: 96.3,
      packetLossPct: 1.8,
      backhaulLatencyMs: 32,
      status: "degraded",
      ts: now,
    },
  ];
}
