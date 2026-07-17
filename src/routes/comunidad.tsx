import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/site/PageHero";
import { Users, MessageCircle, Vote, Heart } from "lucide-react";

export const Route = createFileRoute("/comunidad")({
  head: () => ({
    meta: [
      { title: "Comunidad · Foro federado · RDM" },
      { name: "description", content: "Foro, votaciones soberanas y eventos ciudadanos del Sistema Operativo Territorial." },
      { property: "og:title", content: "Comunidad · RDM Digital" },
      { property: "og:description", content: "Donde la ciudadanía pulsa al kernel territorial." },
    ],
  }),
  component: ComunidadPage,
});

const THREADS = [
  { author: "Anubis Villaseñor", title: "Propuesta: rehabilitar la Plaza Constitución como nodo de telemetría abierta", replies: 24, likes: 102, tag: "Gobernanza" },
  { author: "Doña Cleotilde", title: "Receta abierta: paste de mole con masa de cebada local", replies: 41, likes: 230, tag: "Gastronomía" },
  { author: "Edwin O. Castillo", title: "Manifiesto soberano: ¿qué significa ser ciudadano de un OS territorial?", replies: 88, likes: 412, tag: "Doctrina" },
  { author: "Comité del Bosque", title: "Voluntariado de reforestación · Parque El Chico · 14 sep", replies: 13, likes: 76, tag: "Comunidad" },
  { author: "Realito AI", title: "Resumen semanal: 3,201 pulsos federados, 7 nuevas plataformas conectadas", replies: 5, likes: 191, tag: "Tecnología" },
];

function ComunidadPage() {
  return (
    <>
      <PageHero
        eyebrow="XIII · Pulso"
        title="Comunidad"
        highlight="federada."
        description="Foro abierto, votaciones soberanas y red ciudadana. Cada interacción alimenta a Anubis y Chronos."
      />
      <section className="container mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-3 gap-3 mb-8">
          {[
            { label: "Ciudadanos federados", value: "1,284", icon: Users },
            { label: "Hilos activos", value: "212", icon: MessageCircle },
            { label: "Votaciones abiertas", value: "7", icon: Vote },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border-hairline bg-card p-5">
              <s.icon className="w-4 h-4 text-accent mb-2" />
              <div className="font-display text-3xl text-ink">{s.value}</div>
              <div className="font-mono text-[10px] tracking-sovereign text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <h2 className="font-display text-2xl text-ink mb-4">Hilos destacados</h2>
        <ul className="space-y-3">
          {THREADS.map((t) => (
            <li key={t.title} className="rounded-2xl border-hairline bg-card p-5 hover:shadow-sovereign transition-all">
              <div className="flex items-center justify-between mb-2 text-[10px] font-mono tracking-sovereign">
                <span className="text-accent">{t.tag}</span>
                <span className="text-muted-foreground">{t.author}</span>
              </div>
              <h3 className="font-display text-lg text-ink">{t.title}</h3>
              <div className="mt-3 flex gap-4 text-[11px] font-mono text-muted-foreground">
                <span className="inline-flex items-center gap-1"><MessageCircle className="w-3 h-3" />{t.replies}</span>
                <span className="inline-flex items-center gap-1"><Heart className="w-3 h-3" />{t.likes}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
