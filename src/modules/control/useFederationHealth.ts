import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type FederationStatus = {
  key: string;
  name: string;
  status: "online" | "degraded" | "offline";
  latency_ms: number;
  metric: string;
  detail: string;
};

export type HealthSnapshot = {
  timestamp: string;
  summary: { online: number; degraded: number; offline: number; total: number; avg_latency_ms: number; integrity: number };
  federations: FederationStatus[];
};

export function useFederationHealth(intervalMs = 15000) {
  const [data, setData] = useState<HealthSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;
    const load = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("federation-health");
        if (cancel) return;
        if (error) throw error;
        setData(data as HealthSnapshot);
        setError(null);
      } catch (e: unknown) {
        if (!cancel) setError(e instanceof Error ? e.message : String(e));
      } finally {
        if (!cancel) setLoading(false);
      }
    };
    load();
    const id = setInterval(load, intervalMs);
    return () => { cancel = true; clearInterval(id); };
  }, [intervalMs]);

  return { data, loading, error };
}
