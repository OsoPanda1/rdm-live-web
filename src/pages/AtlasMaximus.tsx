import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MapPin, Pickaxe, BookOpen, Sparkles, Compass, Calendar, Building2, Quote, Network } from "lucide-react";
import { RDM_TERRITORY_POIS, mines, pastes, streets, legends, routes, events, territoryStats } from "@/data/atlas/territory-pois";
import { RDM_CORPUS } from "@/data/atlas/corpus";
import { comercios, comercioCategoriaLabel } from "@/data/atlas/comercios-catalog";
import { dichos } from "@/data/atlas/dichos";

const TABS = [
  { id: "pois", label: "POIs Canónicos", icon: MapPin },
  { id: "mines", label: "Minas", icon: Pickaxe },
  { id: "pastes", label: "Pastes", icon: Sparkles },
  { id: "streets", label: "Calles", icon: Building2 },
  { id: "legends", label: "Leyendas", icon: BookOpen },
  { id: "routes", label: "Rutas", icon: Compass },
  { id: "events", label: "Eventos", icon: Calendar },
  { id: "corpus", label: "Corpus Maximus", icon: Network },
  { id: "dichos", label: "Dichos", icon: Quote },
] as const;

export default function AtlasMaximus() {
  const [tab, setTab] = useState<string>("pois");

  const content = useMemo(() => {
    switch (tab) {
      case "pois":
        return RDM_TERRITORY_POIS.map((p: any) => ({ title: p.name, sub: p.category, body: p.description, meta: `Importancia ${p.importance ?? "-"}` }));
      case "mines":
        return mines.map((m: any) => ({ title: m.name, sub: m.status, body: m.description, meta: m.depth ? `${m.depth}m` : "" }));
      case "pastes":
        return pastes.map((p: any) => ({ title: p.name, sub: p.origin, body: p.description, meta: p.price ? `$${p.price}` : "" }));
      case "streets":
        return streets.map((s: any) => ({ title: s.name, sub: s.era ?? "", body: s.description, meta: "" }));
      case "legends":
        return legends.map((l: any) => ({ title: l.name, sub: "Leyenda", body: l.summary ?? l.description, meta: "" }));
      case "routes":
        return routes.map((r: any) => ({ title: r.name, sub: r.difficulty, body: r.description, meta: r.distanceKm ? `${r.distanceKm} km` : "" }));
      case "events":
        return events.map((e: any) => ({ title: e.name, sub: e.month ?? e.date ?? "", body: e.description, meta: "" }));
      case "dichos":
        return dichos.map((d: any) => ({ title: d.jerga ?? d.texto ?? d.title, sub: d.personaje ?? d.autor ?? "Anónimo", body: d.significado ?? d.contexto ?? "", meta: d.inicial ? `Letra ${d.inicial}` : "" }));
      default:
        return [];
    }
  }, [tab]);

  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden border-b border-border bg-gradient-to-br from-[hsl(var(--rdm-amber)/0.15)] via-background to-background pt-24 pb-12 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-xs uppercase tracking-[0.3em] text-[hsl(var(--rdm-amber))] mb-3">
            Corpus Maximus · Atlas Territorial
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-6xl font-bold mb-4" style={{ fontFamily: "var(--font-display)" }}>
            Expediente vivo de Real del Monte
          </motion.h1>
          <p className="text-muted-foreground max-w-2xl mb-6">
            {RDM_TERRITORY_POIS.length} POIs canónicos · {mines.length} minas · {pastes.length} pastes · {streets.length} calles · {legends.length} leyendas · {routes.length} rutas · {events.length} eventos · {comercios.length} comercios federados.
          </p>
          <div className="flex flex-wrap gap-2">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition border ${active ? "bg-[hsl(var(--rdm-amber))] text-white border-[hsl(var(--rdm-amber))]" : "bg-card/60 border-border text-foreground hover:border-[hsl(var(--rdm-amber))]"}`}>
                  <Icon className="w-3.5 h-3.5" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">
        {tab === "corpus" ? (
          <div className="space-y-6">
            {RDM_CORPUS.map((section: any) => (
              <article key={section.id} className="rounded-2xl border border-border bg-card/60 p-6">
                <p className="text-[10px] uppercase tracking-widest text-[hsl(var(--rdm-amber))] mb-1">{section.id}</p>
                <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: "var(--font-display)" }}>{section.title}</h2>
                <div className="space-y-3">
                  {section.entries?.map((entry: any, i: number) => (
                    <div key={i} className="border-l-2 border-[hsl(var(--rdm-amber)/0.4)] pl-4">
                      <p className="text-sm font-medium">{entry.title ?? entry.heading ?? "Entrada"}</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">{entry.body ?? entry.text ?? entry.content}</p>
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {content.map((item, i) => (
              <motion.article
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className="rounded-xl border border-border bg-card/60 p-5 hover:border-[hsl(var(--rdm-amber))] transition"
              >
                {item.sub && <p className="text-[10px] uppercase tracking-widest text-[hsl(var(--rdm-amber))] mb-2">{item.sub}</p>}
                <h3 className="font-semibold mb-2" style={{ fontFamily: "var(--font-display)" }}>{item.title}</h3>
                {item.body && <p className="text-sm text-muted-foreground line-clamp-4">{item.body}</p>}
                {item.meta && <p className="text-xs mt-3 text-[hsl(var(--rdm-amber))]">{item.meta}</p>}
              </motion.article>
            ))}
          </div>
        )}

        <div className="mt-10 rounded-2xl border border-border bg-card/40 p-6">
          <h3 className="text-lg font-semibold mb-3">Comercios federados</h3>
          <p className="text-sm text-muted-foreground mb-4">Catálogo importado del repo LTOS — sólo los que completan registro y membresía aparecerán en el mapa público.</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {comercios.slice(0, 12).map((c: any) => (
              <div key={c.id} className="rounded-lg border border-border/50 p-3">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold">{c.nombre}</p>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[hsl(var(--rdm-amber)/0.15)] text-[hsl(var(--rdm-amber))]">{c.membresia}</span>
                </div>
                <p className="text-xs text-muted-foreground">{comercioCategoriaLabel[c.categoria] ?? c.categoria}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 text-right">
            <Link to="/registro-comercio" className="text-xs text-[hsl(var(--rdm-amber))] hover:underline">
              Registrar mi comercio →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
