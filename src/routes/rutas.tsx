import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { ROUTES_ITEMS } from "@/data/content";
import { Map, Clock } from "lucide-react";

export const Route = createFileRoute("/rutas")({
  head: () => ({
    meta: [
      { title: "Rutas · Itinerarios soberanos · RDM" },
      { name: "description", content: "Cinco itinerarios curados: paste, cornish, minería soberana, mística otomí y bosque mágico." },
      { property: "og:title", content: "Rutas · Real del Monte" },
      { property: "og:description", content: "Itinerarios curados para recorrer la Comarca Minera." },
    ],
  }),
  component: RutasPage,
});

function RutasPage() {
  return (
    <>
      <PageHero
        eyebrow="VII · Itinerarios"
        title="Cinco rutas"
        highlight="para leer un territorio."
        description="Cada ruta encadena lugares, sabores y leyendas en recorridos de medio día a jornada completa."
      />
      <section className="container mx-auto px-6 pb-24">
        <div className="space-y-4">
          {ROUTES_ITEMS.map((r) => (
            <article key={r.code} className="grid md:grid-cols-[110px_1fr_auto] items-start gap-6 rounded-2xl border-hairline bg-card p-6 hover:shadow-sovereign transition-all">
              <div>
                <div className="font-mono text-[10px] tracking-sovereign text-accent">{r.code}</div>
                <div className="font-display text-3xl text-ink mt-1">{r.stops}</div>
                <div className="font-mono text-[10px] text-muted-foreground">paradas</div>
              </div>
              <div>
                <h3 className="font-display text-2xl text-ink">{r.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{r.desc}</p>
              </div>
              <div className="flex md:flex-col gap-3 md:items-end text-[11px] font-mono text-muted-foreground">
                <span className="inline-flex items-center gap-1"><Clock className="w-3 h-3" />{r.duration}</span>
                <span className="inline-flex items-center gap-1"><Map className="w-3 h-3" />guía digital</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
