import { useEffect, useState } from "react";

export interface TourismRoute {
  id: string;
  name: string;
  description: string;
  difficulty: "Fácil" | "Moderada" | "Avanzada";
  duration: string;
  distance: string;
  points: string[];
  color?: string;
  icon?: string;
}

export interface TourismEvent {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  isFeatured: boolean;
}

function useApiResource<T>(url: string, key: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as Record<string, T[]>;
        if (!cancelled) {
          setData(payload[key] ?? []);
        }
      } catch {
        // fallback to static data in caller
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [url, key]);

  return { data, loading };
}

export function useRoutesApi() {
  return useApiResource<TourismRoute>("/api/content/routes", "routes");
}

export function useEventsApi() {
  return useApiResource<TourismEvent>("/api/content/events", "events");
}
