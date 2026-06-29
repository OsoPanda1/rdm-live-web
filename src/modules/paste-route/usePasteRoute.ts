import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DEMO_POIS } from "@/hooks/useDemoMode";

export type PastePoi = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  type: string;
  svg_x: number;
  svg_y: number;
  order_index: number;
  icon: string | null;
  lat: number | null;
  lng: number | null;
  avg_rating: number;
  rating_count: number;
};

export function usePasteRoute() {
  const [pois, setPois] = useState<PastePoi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [demo, setDemo] = useState(false);

  const load = useCallback(async () => {
    try {
      const timeout = new Promise<never>((_, rej) => setTimeout(() => rej(new Error("timeout")), 3500));
      const fetchAll = (async () => {
        const [{ data: poiData, error: pErr }, { data: ratingData, error: rErr }] = await Promise.all([
          supabase.from("paste_pois").select("*").eq("active", true).order("order_index"),
          supabase.from("paste_ratings").select("poi_id, score"),
        ]);
        if (pErr) throw pErr;
        if (rErr) throw rErr;
        return { poiData, ratingData };
      })();
      const { poiData, ratingData } = await Promise.race([fetchAll, timeout]);

      const agg: Record<string, { sum: number; n: number }> = {};
      (ratingData ?? []).forEach((r: { poi_id: string; score: number }) => {
        if (!agg[r.poi_id]) agg[r.poi_id] = { sum: 0, n: 0 };
        agg[r.poi_id].sum += r.score;
        agg[r.poi_id].n += 1;
      });

      const merged: PastePoi[] = (poiData ?? []).map((p) => ({
        ...(p as Omit<PastePoi, "avg_rating" | "rating_count">),
        avg_rating: agg[p.id] ? Number((agg[p.id].sum / agg[p.id].n).toFixed(1)) : 4.8,
        rating_count: agg[p.id]?.n ?? 0,
      }));
      if (!merged.length) { setPois(DEMO_POIS as PastePoi[]); setDemo(true); }
      else { setPois(merged); setDemo(false); }
      setError(null);
    } catch (e) {
      setPois(DEMO_POIS as PastePoi[]);
      setDemo(true);
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  return { pois, loading, error, demo, reload: load };
}
