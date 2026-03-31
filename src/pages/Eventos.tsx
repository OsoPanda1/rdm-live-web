// @ts-nocheck
import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, Clock, Sparkles, Star, ArrowRight } from "lucide-react";
import { RDMLayout } from "@/components/rdm/RDMLayout";
import { SEOMeta } from "@/components/SEOMeta";
import { EVENTOS_RDM, EVENT_CATEGORIES } from "@/data/rdm-events";
import { IMAGE_MAP, RDM_IMAGES } from "@/data/rdm-images";

export default function EventosPage() {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredEvents = useMemo(() => {
    if (activeCategory === "all") return EVENTOS_RDM;
    return EVENTOS_RDM.filter(e => e.category === activeCategory);
  }, [activeCategory]);

  return (
    <RDMLayout>
      <SEOMeta title="Eventos y Festivales — Real del Monte" description="Calendario de eventos culturales, festivales gastronómicos, actividades deportivas y temporadas especiales en Real del Monte, Pueblo Mágico." />

      {/* Hero */}
      <section className="relative h-[50vh] min-h-[400px] overflow-hidden">
        <img src={RDM_IMAGES.festivalPaste} alt="Festival del Paste" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(var(--background))] via-black/40 to-black/20" />
        <div className="relative z-10 h-full flex items-end pb-12 px-6 md:px-16 lg:px-24">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-sm tracking-[0.3em] uppercase text-[hsl(var(--rdm-amber))] mb-3 flex items-center gap-2" style={{ fontFamily: "var(--font-body)" }}>
              <Calendar className="w-4 h-4" /> Agenda Cultural
            </p>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-3" style={{ fontFamily: "var(--font-display)" }}>
              Eventos y <span className="text-[hsl(var(--rdm-amber))]">Festivales</span>
            </h1>
            <p className="text-white/70 max-w-xl" style={{ fontFamily: "var(--font-body)" }}>
              {EVENTOS_RDM.length} eventos que hacen de Real del Monte un destino vivo todo el año.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-6 px-6 md:px-16 lg:px-24 border-b border-[hsl(var(--border))]">
        <div className="max-w-6xl mx-auto flex flex-wrap gap-2">
          {EVENT_CATEGORIES.map(cat => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={`px-4 py-2 rounded-full text-xs font-medium border transition ${
                activeCategory === cat.value
                  ? "bg-[hsl(var(--rdm-amber))] text-white border-[hsl(var(--rdm-amber))]"
                  : "rdm-glass border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--rdm-amber))]"
              }`}
              style={{ fontFamily: "var(--font-body)" }}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-12 px-6 md:px-16 lg:px-24">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 mb-6 text-sm text-[hsl(var(--muted-foreground))]">
            <Sparkles className="h-3.5 w-3.5 text-[hsl(var(--rdm-amber))]" />
            <span>{filteredEvents.length} evento{filteredEvents.length !== 1 ? "s" : ""}</span>
          </div>

          {filteredEvents.length === 0 ? (
            <div className="text-center py-16 rdm-glass rounded-2xl">
              <Calendar className="h-12 w-12 text-[hsl(var(--muted-foreground))] mx-auto mb-4 opacity-40" />
              <p className="text-[hsl(var(--muted-foreground))]">No hay eventos en esta categoría.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredEvents.map((evt, i) => {
                const imgSrc = IMAGE_MAP[evt.image] || RDM_IMAGES.plazaPrincipal;
                return (
                  <motion.article
                    key={evt.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="rdm-glass rounded-xl overflow-hidden group hover:shadow-md transition-shadow"
                  >
                    <div className="relative h-44 overflow-hidden">
                      <img src={imgSrc} alt={evt.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className="px-2 py-1 rounded-full bg-[hsl(var(--rdm-amber))] text-white text-[10px] font-bold">{evt.date}</span>
                        {evt.destacado && <span className="px-2 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-[10px]">⭐ Destacado</span>}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-base mb-2" style={{ fontFamily: "var(--font-display)" }}>{evt.name}</h3>
                      <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed mb-3 line-clamp-3" style={{ fontFamily: "var(--font-body)" }}>{evt.description}</p>
                      <div className="flex flex-wrap gap-2 text-[10px] text-[hsl(var(--muted-foreground))]">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{evt.time}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{evt.location}</span>
                        {evt.precio && <span className="ml-auto font-semibold text-[hsl(var(--rdm-amber))]">{evt.precio}</span>}
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </RDMLayout>
  );
}
