import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Search, ExternalLink } from "lucide-react";
import data from "@/data/ltos-platforms.json";
import { federationColor, HEPTA_LAYERS } from "@/lib/federation";

export const Route = createFileRoute("/ltos")({
  head: () => ({
    meta: [
      { title: "LTOS · 12 Plataformas Federadas · RDM Digital" },
      { name: "description", content: "Catálogo de las 12 sub-plataformas absorbidas en el Sistema Operativo Territorial LTOS de Real del Monte." },
      { property: "og:title", content: "LTOS · 12 Plataformas Federadas" },
      { property: "og:description", content: "Kernels, Smart City, Digital Twin, Atlas, Civilizational Core y más." },
    ],
  }),
  component: LtosPage,
});

function LtosPage() {
  const [q, setQ] = useState("");
  const [fed, setFed] = useState<string>("Todas");
  const feds = useMemo(() => ["Todas", ...HEPTA_LAYERS.map((l) => l.key)], []);
  const filtered = useMemo(
    () =>
      data.platforms.filter((p) => {
        const txt = `${p.name} ${p.role} ${p.slug} ${p.highlights.join(" ")}`.toLowerCase();
        return (fed === "Todas" || p.federation === fed) && (!q || txt.includes(q.toLowerCase()));
      }),
    [q, fed],
  );

  return (
    <section className="container mx-auto px-6 py-16">
      <div className="max-w-3xl">
        <div className="font-mono text-[10px] tracking-sovereign text-accent mb-3">II · Catálogo</div>
        <h1 className="font-display text-5xl md:text-6xl text-ink">Plataforma <span className="text-gradient-copper italic">LTOS</span></h1>
        <p className="mt-4 text-muted-foreground">Doce sub-plataformas absorbidas en un único Sistema Operativo Territorial. Arquitecto: <strong>{data.architect}</strong>.</p>
        <p className="mt-1 text-[11px] font-mono text-muted-foreground">ORCID {data.credentials.orcid} · DOI {data.credentials.doi}</p>
      </div>

      <div className="mt-10 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar plataforma, módulo, edge function…"
            className="w-full rounded-full border-hairline bg-card pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {feds.map((f) => (
            <button
              key={f}
              onClick={() => setFed(f)}
              className={`rounded-full px-3 py-2 text-[11px] font-mono tracking-wider border transition-colors ${
                fed === f ? "bg-foreground text-background border-foreground" : "border-hairline hover:bg-secondary"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((p) => {
          const color = federationColor(p.federation);
          return (
            <article key={p.slug} className="relative rounded-2xl border-hairline bg-card p-6 overflow-hidden hover:shadow-sovereign transition-all">
              <div className="absolute top-0 left-0 right-0 h-1" style={{ background: color }} />
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] tracking-sovereign px-2 py-1 rounded-full" style={{ background: `${color}22`, color }}>{p.federation}</span>
                <a href={`https://github.com/${data.owner}/${p.slug}`} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-accent">
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <h3 className="font-display text-xl text-ink mt-4">{p.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">{p.role}</p>
              <div className="mt-4 grid grid-cols-4 gap-2">
                {[
                  ["files", p.files], ["src", p.src], ["pages", p.pages], ["edge", p.edge],
                ].map(([k, v]) => (
                  <div key={String(k)} className="text-center">
                    <div className="font-display text-lg text-ink">{v}</div>
                    <div className="font-mono text-[9px] tracking-sovereign text-muted-foreground">{k}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-1">
                {p.highlights.slice(0, 4).map((h) => (
                  <span key={h} className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{h}</span>
                ))}
              </div>
            </article>
          );
        })}
      </div>
      <p className="mt-10 text-center text-xs text-muted-foreground">{filtered.length} de {data.platforms.length} plataformas</p>
      <div className="mt-6 text-center">
        <Link to="/federacion" className="text-sm text-accent hover:underline">→ Ver la heptafederación completa</Link>
      </div>
    </section>
  );
}
