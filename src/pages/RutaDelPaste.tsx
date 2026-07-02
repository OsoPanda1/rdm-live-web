// @ts-nocheck
import { motion } from "framer-motion";
import { Utensils, Compass } from "lucide-react";
import RutaDelPasteSVG from "@/modules/paste-route/RutaDelPasteSVG";
import { ShareRatingsButton } from "@/modules/paste-route/ShareRatingsButton";
import { usePasteRoute } from "@/modules/paste-route/usePasteRoute";

export default function RutaDelPaste() {
  const { pois, demo } = usePasteRoute();
  return (
    <div className="min-h-screen pt-28 pb-24 px-6 lg:px-12">
      <div className="mx-auto max-w-6xl space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-xl bg-gold/15 flex items-center justify-center">
              <Utensils className="h-5 w-5 text-gold" />
            </div>
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-gold/70">Experiencia Gastronómica · Interactiva</p>
          </div>
          <h1 className="text-5xl md:text-6xl font-display font-bold tracking-tight">
            La <span className="text-gradient-gold italic">Ruta del Paste</span>
          </h1>
          <p className="mt-3 text-base font-body text-muted-foreground max-w-2xl">
            Un recorrido por el alma cornish-mexicana de Real del Monte. Arrastra el mapa, haz zoom y pulsa cada punto para descubrir su historia.
          </p>
        </motion.div>

        {demo && (
          <div className="rounded-xl border border-amber-400/30 bg-amber-500/5 px-4 py-2 text-[11px] font-mono text-amber-300">
            Modo demo activo · datos de respaldo locales (Supabase no disponible).
          </div>
        )}

        <RutaDelPasteSVG />

        <div className="glass-card rounded-2xl border border-gold/20 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-gold/70">Mis valoraciones</p>
            <p className="text-sm font-body text-muted-foreground">Exporta tu recorrido en PDF o comparte tu opinión con el municipio.</p>
          </div>
          <ShareRatingsButton pois={pois} />
        </div>


        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Distancia", value: "2.8 km" },
            { label: "Duración", value: "1.5 – 2 hrs" },
            { label: "Paradas culinarias", value: "6 puntos" },
          ].map((s) => (
            <div key={s.label} className="glass-card rounded-2xl p-5 border border-gold/15">
              <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-gold/70 flex items-center gap-2"><Compass className="h-3 w-3" /> {s.label}</p>
              <p className="mt-2 text-3xl font-display text-platinum">{s.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}