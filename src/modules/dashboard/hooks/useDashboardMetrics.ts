/**
 * Hook para métricas del Dashboard CEO.
 * Consume el edge function `metrics-aggregates`.
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DashboardKpis {
  places_active: number;
  businesses_verified: number;
  events_upcoming: number;
  premium_active: number;
  commerce_active: number;
  tracking_events_24h: number;
  bookings_24h: number;
  revenue_24h: number;
  redemptions_24h: number;
}

export interface DashboardBreakdown {
  event_types: Record<string, number>;
  hourly_activity: Record<string, number>;
  top_places: Record<string, number>;
}

export interface DashboardSnapshot {
  kpis: DashboardKpis;
  breakdown: DashboardBreakdown;
  generated_at: string;
}

export function useDashboardMetrics() {
  return useQuery<DashboardSnapshot>({
    queryKey: ["dashboard-metrics"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke<DashboardSnapshot>("metrics-aggregates");
      if (error) throw error;
      if (!data) throw new Error("No metrics returned");
      return data;
    },
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}
