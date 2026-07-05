import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHero } from "@/components/site/PageHero";
import { MERCHANTS } from "@/data/content";
import { Store, Search } from "lucide-react";

export const Route = createFileRoute("/comercios")({
  head: () => ({
    meta: [
      { title: "Comercios federados · RDM Digital" },
      { name: "description", content: "Directorio de comercios patrimoniales, gastronomía, hospedaje y aventura registrados en el kernel LTOS." },
      { property: "og:title", content: "Comercios · RDM Digital" },
      { property: "og:description", content: "Negocios federados, certificados y soberanos de Real del Monte." },
    ],
  }),
  component: ComerciosPage,
});

const TIERS = ["Todos", "Patrimonial", "Premium", "Estándar"] as const;

function ComerciosPage() {
  const [q, setQ] = useState("");
  const [tier, setTier] = useState<(typeof TIERS)[number]>("Todos");
  const filtered = useMemo(
    () =>
      MERCHANTS.filter((m) => {
        const okT = tier === "Todos" || m.tier === tier;
        const okQ = !q || `${m.name} ${m.category}`.toLowerCase().includes(q.toLowerCase());
        return okT && okQ;
      }),
    [q, tier],
  );
  return (
    <>
      <PageHero
        eyebrow="IX · Comercio"
        title="Comercios"
        highlight="federados."
        description="Negocios patrimoniales y emergentes, registrados en la capa PHOENIX del kernel territorial."
      />
      <section className="container mx-auto px-6 pb-24">
        <div className="flex flex-col md:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar comercio o categoría…" className="w-full rounded-full border-hairline bg-card pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40" />
          </div>
          <div className="flex gap-1.5">
            {TIERS.map((t) => (
              <button key={t} onClick={() => setTier(t)} className={`rounded-full px-3 py-2 text-[11px] font-mono tracking-wider border transition-colors ${tier === t ? "bg-foreground text-background border-foreground" : "border-hairline hover:bg-secondary"}`}>{t}</button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((m) => (
            <article key={m.name} className="rounded-2xl border-hairline bg-card p-6 hover:shadow-sovereign transition-all">
              <div className="flex items-center justify-between">
                <Store className="w-5 h-5 text-accent" />
                <span className="text-[10px] font-mono tracking-sovereign px-2 py-1 rounded-full bg-secondary text-muted-foreground">{m.tier}</span>
              </div>
              <h3 className="font-display text-xl text-ink mt-4">{m.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{m.category}</p>
              <div className="mt-4 font-mono text-[10px] tracking-sovereign text-muted-foreground">desde {m.since}</div>
            </article>
          ))}
        </div>
        <p className="mt-8 text-xs text-center text-muted-foreground">{filtered.length} de {MERCHANTS.length} comercios</p>
      </section>
    </>
  );
}
