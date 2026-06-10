export type GeoPoint = { lat: number; lon: number };

export type ClimateSnapshot = {
  location: GeoPoint;
  temperatureC: number;
  humidityPct: number;
  condition: string;
  provider: string;
  ts: string;
};

export type WifiNodeHealth = {
  id: string;
  location: GeoPoint;
  signalStrengthDbm: number;
  uptimePct: number;
  packetLossPct: number;
  backhaulLatencyMs: number;
  status: "online" | "degraded" | "offline";
  ts: string;
};

export type AggregatedPresence = {
  zoneId: string;
  avgDwellMinutes: number;
  visitorCount: number;
  tsRange: { from: string; to: string };
};
