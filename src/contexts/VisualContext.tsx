import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { computeTimeTheme, type TimeTheme } from "@/hooks/useTimeTheme";
import { useWeather } from "@/hooks/useWeather";

export type VisualState =
  | "clear_day"
  | "clear_evening"
  | "clear_night"
  | "cloudy_day"
  | "cloudy_evening"
  | "cloudy_night"
  | "rain_day"
  | "rain_evening"
  | "rain_night";

interface VisualContextValue {
  timeTheme: TimeTheme;
  visualState: VisualState;
}

const VisualContext = createContext<VisualContextValue | null>(null);

const weatherToFamily = (condition?: string): "clear" | "cloudy" | "rain" => {
  if (!condition) return "clear";
  const normalized = condition.toLowerCase();
  if (normalized.includes("rain") || normalized.includes("storm") || normalized.includes("drizzle")) {
    return "rain";
  }
  if (normalized.includes("cloud") || normalized.includes("mist") || normalized.includes("fog")) {
    return "cloudy";
  }
  return "clear";
};

export function VisualProvider({ children }: { children: React.ReactNode }) {
  const [timeTheme, setTimeTheme] = useState<TimeTheme>(computeTimeTheme());
  const weather = useWeather();

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTimeTheme(computeTimeTheme());
    }, 5 * 60 * 1000);

    return () => window.clearInterval(interval);
  }, []);

  const visualState = useMemo<VisualState>(() => {
    const family = weatherToFamily(weather?.condition);

    if (timeTheme === "day") return `${family}_day` as VisualState;
    if (timeTheme === "evening") return `${family}_evening` as VisualState;
    return `${family}_night` as VisualState;
  }, [timeTheme, weather?.condition]);

  return <VisualContext.Provider value={{ timeTheme, visualState }}>{children}</VisualContext.Provider>;
}

export function useVisual() {
  const value = useContext(VisualContext);
  if (!value) {
    throw new Error("useVisual must be used within VisualProvider");
  }
  return value;
}
