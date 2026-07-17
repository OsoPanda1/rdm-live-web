import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { TIMELINE } from "@/data/content";

export const Route = createFileRoute("/historia")({
  head: () => ({
    meta: [
      { title: "Historia · RDM Digital LTOS" },
      { name: "description", content: "Cronología minera y cultural de Real del Monte: Cornwall, plata, paste, Geoparque." },
      { property: "og:title", content: "Historia · Real del Monte" },
      { property: "og:description", content: "Hitos mineros, intercambio cornish y memoria patrimonial viva." },
    ],
  }),
  component: HistoriaPage,
});

function HistoriaPage() {
  return (
    <>
      <PageHero
        eyebrow="III · Memoria"
        title="Bajo estas montañas,"
        highlight="imperios nacieron."
        description="Recorrido cronológico por los hitos mineros, la herencia cornish y la evolución social que dieron forma a la comarca."
      />
      <section className="container mx-auto px-6 pb-24">
        <ol className="relative border-l border-hairline pl-8 space-y-10">
          {TIMELINE.map((t, i) => (
            <li key={i} className="relative">
              <span className="absolute -left-[42px] top-1.5 w-3 h-3 rounded-full bg-accent shadow-card" />
              <div className="font-mono text-[10px] tracking-sovereign text-accent">{t.year}</div>
              <p className="font-display text-xl text-ink mt-1 max-w-3xl">{t.event}</p>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
