import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHero } from "@/components/site/PageHero";
import { DICHOS, DICHO_CATS } from "@/data/content";
import { Quote, Heart } from "lucide-react";

export const Route = createFileRoute("/dichos")({
  head: () => ({
    meta: [
      { title: "Dichos del Real · Memoria oral · RDM" },
      { name: "description", content: "Refranero minero, brindis y humor cornish-mexicano. Memoria oral de Real del Monte." },
      { property: "og:title", content: "Dichos del Real" },
      { property: "og:description", content: "Refranero oral y brindis mineros de la Comarca." },
    ],
  }),
  component: DichosPage,
});

function DichosPage() {
  const [cat, setCat] = useState("all");
  const [liked, setLiked] = useState<Set<number>>(new Set());
  const filtered = useMemo(() => DICHOS.filter((d) => cat === "all" || d.categoria === cat), [cat]);
  const toggle = (i: number) => setLiked((p) => { const s = new Set(p); s.has(i) ? s.delete(i) : s.add(i); return s; });
  return (
    <>
      <PageHero
        eyebrow="X · Memoria oral"
        title="Dichos"
        highlight="del Real."
        description="Refranero, brindis y humor cornish-mexicano recopilado por la comunidad y custodiado en BookPi."
      />
      <section className="container mx-auto px-6 pb-24">
        <div className="flex flex-wrap gap-1.5 mb-8">
          {DICHO_CATS.map((c) => (
            <button key={c.id} onClick={() => setCat(c.id)} className={`rounded-full px-3 py-2 text-[11px] font-mono border transition-colors ${cat === c.id ? "bg-foreground text-background border-foreground" : "border-hairline hover:bg-secondary"}`}>
              <span className="mr-1">{c.icon}</span>{c.label}
            </button>
          ))}
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          {filtered.map((d, i) => (
            <article key={i} className="relative rounded-2xl border-hairline bg-card p-7 hover:shadow-sovereign transition-all">
              <Quote className="absolute top-4 right-4 w-8 h-8 text-accent/20" />
              <p className="font-display text-2xl text-ink italic leading-tight">“{d.texto}”</p>
              <p className="mt-3 text-sm text-muted-foreground">{d.significado}</p>
              <div className="mt-5 flex items-center justify-between">
                <span className="font-mono text-[10px] tracking-sovereign text-accent">— {d.personaje}</span>
                <button onClick={() => toggle(i)} className="text-muted-foreground hover:text-accent">
                  <Heart className={`w-4 h-4 ${liked.has(i) ? "fill-accent text-accent" : ""}`} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
