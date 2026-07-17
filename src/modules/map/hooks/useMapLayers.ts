/**
 * Capas dinámicas del Gemelo Digital.
 * Lee `dt_layers` y permite togglear capas en memoria.
 */
import { useQuery } from "@tanstack/react-query";
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface DtLayer {
  id: string;
  key: string;
  name: string;
  description: string | null;
  color: string;
  icon: string;
  is_active: boolean;
  sort_order: number;
}

export function useMapLayers() {
  const layersQuery = useQuery<DtLayer[]>({
    queryKey: ["dt-layers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dt_layers")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as DtLayer[];
    },
  });

  const [activeKeys, setActiveKeys] = useState<Set<string>>(
    new Set(["cultural", "economic", "events", "mining"]),
  );

  const toggle = useCallback((key: string) => {
    setActiveKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  }, []);

  const isActive = useCallback((key: string) => activeKeys.has(key), [activeKeys]);

  return { layers: layersQuery.data ?? [], isLoading: layersQuery.isLoading, isActive, toggle, activeKeys };
}
