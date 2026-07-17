import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { EVENTS } from "@/data/content";
import { Calendar, MapPin } from "lucide-react";

export const Route = createFileRoute("/eventos")({
  head: () => ({
    meta: [
      { title: "Eventos · Calendario civilizatorio · RDM" },
      { name: "description", content: "Agenda federada: asambleas, hackatones, festivales y vigilias en Real del Monte." },
      { property: "og:title", content: "Eventos · RDM Digital" },
      { property: "og:description", content: "Calendario civilizatorio del Sistema Operativo Territorial LTOS." },
    ],
  }),
  component: EventosPage,
});

const TAG_COLOR: Record<string, string> = {
  Gobernanza: "oklch(0.55 0.13 220)",
  Tecnología: "oklch(0.6 0.14 80)",
  Gastronomía: "oklch(0.62 0.18 30)",
  Cultura: "oklch(0.5 0.16 330)",
  Comunidad: "oklch(0.58 0.15 130)",
};

function EventosPage() {
  return (
    <>
      <PageHero
        eyebrow="VIII · Agenda"
        title="Calendario"
        highlight="civilizatorio."
        description="Convergencias entre gobernanza, cultura, tecnología y comunidad bajo el kernel LTOS."
      />
      <section className="container mx-auto px-6 pb-24">
        <ul className="divide-y divide-hairline rounded-2xl border-hairline bg-card overflow-hidden">
          {EVENTS.map((e) => {
            const d = new Date(e.date);
            return (
              <li key={e.title} className="grid md:grid-cols-[120px_1fr_auto] items-center gap-6 px-6 py-5 hover:bg-secondary/40">
                <div>
                  <div className="font-display text-4xl text-ink leading-none">{d.getDate()}</div>
                  <div className="font-mono text-[10px] tracking-sovereign text-muted-foreground uppercase mt-1">
                    {d.toLocaleString("es-MX", { month: "short", year: "numeric" })}
                  </div>
                </div>
                <div>
                  <h3 className="font-display text-xl text-ink">{e.title}</h3>
                  <div className="mt-1 flex items-center gap-3 text-[11px] font-mono text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><MapPin className="w-3 h-3" />{e.place}</span>
                    <span className="inline-flex items-center gap-1"><Calendar className="w-3 h-3" />confirmado</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-3 py-1 rounded-full justify-self-start md:justify-self-end" style={{ background: `${TAG_COLOR[e.tag]}22`, color: TAG_COLOR[e.tag] }}>{e.tag}</span>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
