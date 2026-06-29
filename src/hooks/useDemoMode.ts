import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Modo demo: si Supabase está caído o tarda, activamos fallbacks mockeados
 * para que la presentación municipal nunca se rompa.
 */
export function useDemoMode() {
  const [demo, setDemo] = useState<boolean>(() => localStorage.getItem("rdm_demo_force") === "1");
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("rdm_demo_force") === "1") { setDemo(true); setChecked(true); return; }
    let cancel = false;
    const t = setTimeout(() => { if (!cancel) { setDemo(true); setChecked(true); } }, 4000);
    (async () => {
      try {
        const { error } = await supabase.from("paste_pois").select("id").limit(1);
        if (!cancel) { clearTimeout(t); setDemo(!!error); setChecked(true); }
      } catch {
        if (!cancel) { clearTimeout(t); setDemo(true); setChecked(true); }
      }
    })();
    return () => { cancel = true; clearTimeout(t); };
  }, []);

  const toggle = (v?: boolean) => {
    const next = v ?? !demo;
    if (next) localStorage.setItem("rdm_demo_force", "1");
    else localStorage.removeItem("rdm_demo_force");
    setDemo(next);
  };

  return { demo, checked, toggle };
}

export const DEMO_POIS = [
  { id: "p1", slug: "alfonsina", name: "Pastes Alfonsina", description: "El templo del paste original.", type: "shop", svg_x: 180, svg_y: 220, order_index: 1, icon: "🥟", lat: 20.142, lng: -98.667, avg_rating: 4.9, rating_count: 122 },
  { id: "p2", slug: "real-paste", name: "Real del Paste", description: "Receta cornish del siglo XIX.", type: "shop", svg_x: 320, svg_y: 280, order_index: 2, icon: "⛏️", lat: 20.143, lng: -98.668, avg_rating: 4.8, rating_count: 98 },
  { id: "p3", slug: "museo-paste", name: "Museo del Paste", description: "Historia viva cornish-mexicana.", type: "museum", svg_x: 480, svg_y: 200, order_index: 3, icon: "🏛️", lat: 20.144, lng: -98.669, avg_rating: 4.7, rating_count: 215 },
  { id: "p4", slug: "plaza", name: "Plaza Principal", description: "Centro neurálgico del recorrido.", type: "plaza", svg_x: 600, svg_y: 320, order_index: 4, icon: "🌳", lat: 20.145, lng: -98.670, avg_rating: 4.6, rating_count: 340 },
  { id: "p5", slug: "panteon-ingles", name: "Panteón Inglés", description: "Memoria minera cornish.", type: "heritage", svg_x: 760, svg_y: 240, order_index: 5, icon: "⚰️", lat: 20.146, lng: -98.671, avg_rating: 4.9, rating_count: 178 },
  { id: "p6", slug: "mina-acosta", name: "Mina La Acosta", description: "Socavón del Rey y bocamina.", type: "mine", svg_x: 880, svg_y: 360, order_index: 6, icon: "⛰️", lat: 20.147, lng: -98.672, avg_rating: 5.0, rating_count: 401 },
];
