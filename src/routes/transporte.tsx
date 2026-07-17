import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { TRANSPORT } from "@/data/content";
import { Bus, Clock, Banknote, Repeat } from "lucide-react";

export const Route = createFileRoute("/transporte")({
  head: () => ({
    meta: [
      { title: "Transporte · Shuttle CDMX y rutas locales · RDM" },
      { name: "description", content: "Cómo llegar a Real del Monte: combi desde Pachuca, shuttle CDMX y rutas internas." },
      { property: "og:title", content: "Transporte · RDM Digital" },
      { property: "og:description", content: "Movilidad federada para Real del Monte y la Comarca Minera." },
    ],
  }),
  component: TransportePage,
});

function TransportePage() {
  return (
    <>
      <PageHero
        eyebrow="XI · Movilidad"
        title="Cómo llegar,"
        highlight="cómo moverse."
        description="Conexiones federadas entre CDMX, Pachuca, Real del Monte y la Comarca Minera."
      />
      <section className="container mx-auto px-6 pb-24">
        <div className="overflow-hidden rounded-2xl border-hairline bg-card">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-[10px] font-mono tracking-sovereign uppercase text-muted-foreground">
              <tr>
                <th className="text-left px-5 py-3">Ruta</th>
                <th className="text-left px-5 py-3">Modo</th>
                <th className="text-left px-5 py-3"><Clock className="inline w-3 h-3 mr-1" />Tiempo</th>
                <th className="text-left px-5 py-3"><Banknote className="inline w-3 h-3 mr-1" />Costo</th>
                <th className="text-left px-5 py-3"><Repeat className="inline w-3 h-3 mr-1" />Frecuencia</th>
              </tr>
            </thead>
            <tbody>
              {TRANSPORT.map((t) => (
                <tr key={t.route} className="border-t border-hairline hover:bg-secondary/30">
                  <td className="px-5 py-4 font-display text-ink">{t.route}</td>
                  <td className="px-5 py-4"><span className="inline-flex items-center gap-1.5 text-muted-foreground"><Bus className="w-3.5 h-3.5 text-accent" />{t.mode}</span></td>
                  <td className="px-5 py-4 font-mono text-xs">{t.time}</td>
                  <td className="px-5 py-4 font-mono text-xs text-accent">{t.cost}</td>
                  <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{t.freq}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
