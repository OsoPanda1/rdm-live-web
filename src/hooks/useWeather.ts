import { useEffect, useState } from "react";

export interface WeatherPayload {
  condition: string;
  description: string;
  temp: number;
  isDay: boolean;
}

export function useWeather() {
  const [data, setData] = useState<WeatherPayload | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await fetch("/api/weather/mineral-del-monte");
        if (!response.ok) {
          return;
        }

        const json = (await response.json()) as WeatherPayload;
        if (!cancelled) {
          setData(json);
        }
      } catch {
        // graceful fallback for static environments
      }
    };

    void load();
    const interval = window.setInterval(load, 5 * 60 * 1000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  return data;
}
