import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { DISHES } from "@/data/content";

export const Route = createFileRoute("/gastronomia")({
  head: () => ({
    meta: [
      { title: "Gastronomía · Pastes y cocina minera · RDM Digital" },
      { name: "description", content: "Pastes tradicionales, cocina de altura y bebidas ancestrales de Real del Monte." },
      { property: "og:title", content: "Gastronomía de Real del Monte" },
      { property: "og:description", content: "Sabores que cruzan océanos: cornish, hidalguense y otomí." },
    ],
  }),
  component: GastroPage,
});

function GastroPage() {
  return (
    <>
      <PageHero
        eyebrow="IV · Sabor"
        title="Sabores que cruzan"
        highlight="océanos."
        description="Catálogo gastronómico curado: pastes patrimoniales, barbacoa, pulques curados y café de olla servidos en barro."
      />
      <section className="container mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {DISHES.map((d) => (
            <article key={d.name} className="rounded-2xl border-hairline bg-card p-6 hover:shadow-sovereign transition-all">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display text-xl text-ink leading-tight">{d.name}</h3>
                <span className="font-mono text-sm text-accent shrink-0">{d.price}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{d.desc}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
