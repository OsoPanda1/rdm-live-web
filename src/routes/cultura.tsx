import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { CULTURE } from "@/data/content";

export const Route = createFileRoute("/cultura")({
  head: () => ({
    meta: [
      { title: "Cultura · Festival del Paste, Panteón Inglés · RDM" },
      { name: "description", content: "Patrimonio cultural cornish-mexicano, museos y festividades de Real del Monte." },
      { property: "og:title", content: "Cultura · Real del Monte" },
      { property: "og:description", content: "Museos, festivales y arquitectura de cantera." },
    ],
  }),
  component: CulturaPage,
});

function CulturaPage() {
  return (
    <>
      <PageHero
        eyebrow="VI · Patrimonio"
        title="Una cultura"
        highlight="bilingüe del subsuelo."
        description="Patrimonio cornish-mexicano, museografía digital y festividades de devoción comunitaria."
      />
      <section className="container mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-2 gap-5">
          {CULTURE.map((c) => (
            <article key={c.title} className="rounded-2xl border-hairline bg-card p-7 hover:shadow-sovereign transition-all">
              <div className="font-mono text-[10px] tracking-sovereign text-accent">{c.subtitle}</div>
              <h3 className="font-display text-2xl text-ink mt-2">{c.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{c.desc}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
