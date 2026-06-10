import type { ClimateSnapshot, GeoPoint } from "./types";
import { logger } from "@core-kernel/log";

const CLIMATE_API_URL = "https://api.open-meteo.com/v1/forecast";

type OpenMeteoCurrent = {
  current_weather?: {
    temperature?: number;
    weathercode?: number;
  };
};

export async function fetchClimate(point: GeoPoint): Promise<ClimateSnapshot> {
  const { lat, lon } = point;

  try {
    const res = await fetch(
      `${CLIMATE_API_URL}?latitude=${lat}&longitude=${lon}&current_weather=true`,
    );
    const data = (await res.json()) as OpenMeteoCurrent;

    return {
      location: point,
      temperatureC: data.current_weather?.temperature ?? 0,
      humidityPct: 0,
      condition: data.current_weather?.weathercode?.toString() ?? "unknown",
      provider: "open-meteo",
      ts: new Date().toISOString(),
    };
  } catch (error) {
    logger.error("Error fetching climate", {
      module: "territorial-sensing",
      federation: "analytics",
    }, error);
    throw error;
  }
}
