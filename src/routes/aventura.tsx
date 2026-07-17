import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { ADVENTURES } from "@/data/content";
import { Mountain, Clock, Zap } from "lucide-react";

export const Route = createFileRoute("/aventura")({
  head: () => ({
    meta: [
      { title: "Aventura · Tirolesa, rappel, espeleología · RDM" },
      { name: "description", content: "Actividades de montaña y aventura en Real del Monte y el Parque Nacional El Chico." },
      { property: "og:title", content: "Aventura · Real del Monte" },
      { property: "og:description", content: "Tirolesa, rappel, ciclismo de montaña y espeleología en la Comarca Minera." },
    ],
  }),
  component: AventuraPage,
});

const LEVEL_COLOR: Record<string, string> = {
  Principiante: "oklch(0.6 0.13 130)",
  Intermedio: "oklch(0.66 0.16 45)",
  Avanzado: "oklch(0.58 0.22 27)",
};

function AventuraPage() {
  return (
    <>
      <PageHero
        eyebrow="V · Montaña"
        title="Aventura"
        highlight="de altura."
        description="Operadores certificados y rutas técnicas sobre los bosques de oyamel del Parque Nacional El Chico."
      />
      <section className="container mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ADVENTURES.map((a) => (
            <article key={a.title} className="group rounded-2xl border-hairline bg-card p-6 hover:shadow-sovereign transition-all">
              <Mountain className="w-5 h-5 text-accent mb-3" />
              <h3 className="font-display text-xl text-ink">{a.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{a.desc}</p>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] font-mono">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full" style={{ background: `${LEVEL_COLOR[a.level]}22`, color: LEVEL_COLOR[a.level] }}>
                  <Zap className="w-3 h-3" /> {a.level}
                </span>
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-3 h-3" /> {a.duration}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
