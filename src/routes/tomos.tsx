import { createFileRoute } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";

const TOMOS = [
  { num: "I", title: "Tomo de la Doctrina TAMV", subtitle: "Ontología, voto fundacional, MD-X4", color: "oklch(0.38 0.05 270)" },
  { num: "II", title: "Tomo del Territorio Vivo", subtitle: "Gemelo digital, calles, minas, capillas", color: "oklch(0.55 0.13 220)" },
  { num: "III", title: "Tomo del Conocimiento", subtitle: "BookPi · corpus civilizatorio · WikiTAMV", color: "oklch(0.6 0.14 80)" },
  { num: "IV", title: "Tomo del Comercio Phoenix", subtitle: "Ciclos económicos federados, B2B soberano", color: "oklch(0.62 0.18 30)" },
  { num: "V", title: "Tomo del Caos Creador", subtitle: "Investigación, exploración, ruptura productiva", color: "oklch(0.5 0.16 330)" },
  { num: "VI", title: "Tomo de Chronos", subtitle: "Timeline civilizatorio, memoria territorial", color: "oklch(0.55 0.1 180)" },
  { num: "VII", title: "Tomo de Dekateotl", subtitle: "Decimación divina, IPFS, retornos a la tierra", color: "oklch(0.58 0.15 130)" },
] as const;

export const Route = createFileRoute("/tomos")({
  head: () => ({
    meta: [
      { title: "Tomos · Corpus Doctrinal TAMV · RDM Digital" },
      { name: "description", content: "Siete tomos doctrinales del kernel heptafederado: doctrina, territorio, conocimiento, comercio, caos, tiempo y decimación." },
      { property: "og:title", content: "Tomos Doctrinales TAMV" },
    ],
  }),
  component: TomosPage,
});

function TomosPage() {
  return (
    <section className="container mx-auto px-6 py-16">
      <div className="max-w-3xl">
        <div className="font-mono text-[10px] tracking-sovereign text-accent mb-3">IV · Biblioteca</div>
        <h1 className="font-display text-5xl md:text-6xl text-ink">Los <span className="text-gradient-copper italic">Tomos</span></h1>
        <p className="mt-4 text-muted-foreground">El corpus doctrinal de la heptafederación. Cada tomo concentra los protocolos, mantras y arquitecturas de una capa del kernel territorial.</p>
      </div>

      <div className="mt-12 space-y-4">
        {TOMOS.map((t) => (
          <article key={t.num} className="group relative rounded-2xl border-hairline bg-card overflow-hidden hover:shadow-sovereign transition-all">
            <div className="absolute left-0 top-0 bottom-0 w-1.5" style={{ background: t.color }} />
            <div className="p-6 md:p-8 flex items-center gap-6 pl-8">
              <div className="font-display text-6xl italic text-ink/20 group-hover:text-ink/40 transition-colors w-20 flex-shrink-0">{t.num}</div>
              <div className="flex-1">
                <div className="font-mono text-[10px] tracking-sovereign text-muted-foreground">Tomo {t.num}</div>
                <h2 className="font-display text-2xl md:text-3xl text-ink mt-1">{t.title}</h2>
                <p className="text-muted-foreground mt-1">{t.subtitle}</p>
              </div>
              <BookOpen className="w-6 h-6 text-muted-foreground group-hover:text-accent transition-colors flex-shrink-0" />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
