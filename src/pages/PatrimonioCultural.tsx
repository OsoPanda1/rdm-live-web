import { useState } from "react";
import { motion } from "framer-motion";
import { Landmark, MapPin, Clock, Star, Filter } from "lucide-react";
import { RDMLayout } from "@/components/rdm/RDMLayout";
import { SEOMeta } from "@/components/SEOMeta";
import { ALL_TERRITORIAL_SITES, MUSEOS_SITIO, ESPACIOS_IDENTIDAD, HITOS_VISUALES, PATRIMONIO_NATURAL, type SitioPatrimonial } from "@/data/rdm-territorial";

type Filtro = "todos" | "museo" | "espacio-identidad" | "monumento" | "hito-visual" | "naturaleza";

const FILTROS: { value: Filtro; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "museo", label: "Museos" },
  { value: "espacio-identidad", label: "Identidad" },
  { value: "hito-visual", label: "Hitos" },
  { value: "naturaleza", label: "Naturaleza" },
];

const CAT_COLOR: Record<string, string> = {
  museo: "hsl(var(--rdm-amber))",
  monumento: "hsl(var(--rdm-red))",
  "espacio-identidad": "hsl(var(--rdm-blue))",
  "hito-visual": "hsl(var(--rdm-purple))",
  naturaleza: "hsl(var(--rdm-green))",
};

function SiteCard({ site, index }: { site: SitioPatrimonial; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.04 }}
      className="rdm-glass rounded-xl p-5 group hover:shadow-md transition-shadow"
    >
      <div className="flex items-start gap-3 mb-3">
        <span className="text-2xl">{site.icono}</span>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="px-2 py-0.5 rounded-full text-[10px] font-medium text-white"
              style={{ background: CAT_COLOR[site.categoria] }}
            >
              {site.categoria.replace("-", " ")}
            </span>
            {site.destacado && <Star className="w-3 h-3 text-[hsl(var(--rdm-amber))]" />}
          </div>
          <h3 className="font-semibold text-base group-hover:text-[hsl(var(--rdm-amber))] transition-colors" style={{ fontFamily: "var(--font-display)" }}>
            {site.nombre}
          </h3>
        </div>
      </div>

      <p className="text-xs text-[hsl(var(--muted-foreground))] leading-relaxed mb-3" style={{ fontFamily: "var(--font-body)" }}>
        {site.descripcion}
      </p>

      <div className="flex items-center justify-between">
        {site.horario && (
          <span className="flex items-center gap-1 text-[10px] text-[hsl(var(--muted-foreground))]">
            <Clock className="w-3 h-3" /> {site.horario}
          </span>
        )}
        <a
          href={`https://www.google.com/maps?q=${site.lat},${site.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[10px] text-[hsl(var(--rdm-amber))] hover:underline ml-auto"
          style={{ fontFamily: "var(--font-body)" }}
        >
          <MapPin className="w-3 h-3" /> Ver ubicación
        </a>
      </div>
    </motion.div>
  );
}

export default function PatrimonioCulturalPage() {
  const [filtro, setFiltro] = useState<Filtro>("todos");

  const sitiosFiltrados = filtro === "todos"
    ? ALL_TERRITORIAL_SITES
    : ALL_TERRITORIAL_SITES.filter((s) => s.categoria === filtro);

  return (
    <RDMLayout>
      <SEOMeta title="Patrimonio Cultural — Real del Monte" description="Museos, monumentos, hitos visuales y patrimonio natural de Real del Monte. Guía completa de activos históricos y culturales." />

      {/* Hero */}
      <section className="pt-24 pb-12 px-6 md:px-16 lg:px-24">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-sm tracking-[0.3em] uppercase text-[hsl(var(--rdm-amber))] mb-3" style={{ fontFamily: "var(--font-body)" }}>
              Inventario Patrimonial
            </p>
            <h1 className="text-4xl md:text-6xl font-bold mb-4" style={{ fontFamily: "var(--font-display)" }}>
              Patrimonio <span className="text-[hsl(var(--rdm-amber))]">cultural</span>
            </h1>
            <p className="text-[hsl(var(--muted-foreground))] max-w-2xl text-lg leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
              {ALL_TERRITORIAL_SITES.length} sitios de interés catalogados: museos de sitio, monumentos, espacios de identidad, hitos visuales y patrimonio natural.
            </p>
          </motion.div>

          {/* Stats */}
          <div className="flex flex-wrap gap-4 mt-8">
            {[
              { label: "Museos", count: MUSEOS_SITIO.length },
              { label: "Identidad", count: ESPACIOS_IDENTIDAD.length },
              { label: "Hitos", count: HITOS_VISUALES.length },
              { label: "Naturaleza", count: PATRIMONIO_NATURAL.length },
            ].map((s) => (
              <div key={s.label} className="rdm-glass rounded-lg px-4 py-2 text-center">
                <p className="text-xl font-bold text-[hsl(var(--rdm-amber))]" style={{ fontFamily: "var(--font-display)" }}>{s.count}</p>
                <p className="text-[10px] text-[hsl(var(--muted-foreground))]" style={{ fontFamily: "var(--font-body)" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filtros */}
      <section className="px-6 md:px-16 lg:px-24 pb-4">
        <div className="max-w-6xl mx-auto flex flex-wrap gap-2 items-center">
          <Filter className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
          {FILTROS.map((f) => (
            <button
              key={f.value}
              onClick={() => setFiltro(f.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                filtro === f.value
                  ? "bg-[hsl(var(--rdm-amber))] text-white border-[hsl(var(--rdm-amber))]"
                  : "bg-transparent border-[hsl(var(--border))] text-[hsl(var(--foreground))] hover:border-[hsl(var(--rdm-amber))]"
              }`}
              style={{ fontFamily: "var(--font-body)" }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </section>

      {/* Grid */}
      <section className="px-6 md:px-16 lg:px-24 pb-20">
        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {sitiosFiltrados.map((site, i) => (
            <SiteCard key={site.id} site={site} index={i} />
          ))}
        </div>
        {sitiosFiltrados.length === 0 && (
          <div className="text-center py-20">
            <Landmark className="w-12 h-12 mx-auto text-[hsl(var(--muted-foreground))] mb-4" />
            <p className="text-[hsl(var(--muted-foreground))]" style={{ fontFamily: "var(--font-body)" }}>No hay sitios en esta categoría.</p>
          </div>
        )}
      </section>
    </RDMLayout>
  );
}
