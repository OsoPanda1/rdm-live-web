import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { PageHero } from "@/components/site/PageHero";
import { Send, Sparkles } from "lucide-react";

export const Route = createFileRoute("/realito")({
  head: () => ({
    meta: [
      { title: "Realito AI · Voz del kernel · RDM" },
      { name: "description", content: "Asistente cognitivo del Sistema Operativo Territorial. Realito conoce historia, rutas, comercios y federación." },
      { property: "og:title", content: "Realito AI · RDM Digital" },
      { property: "og:description", content: "Voz del kernel TAMV MD-X4. Conversa con la inteligencia territorial soberana." },
    ],
  }),
  component: RealitoPage,
});

type Msg = { role: "user" | "assistant"; content: string };

const SEED: Msg[] = [
  { role: "assistant", content: "Soy Realito, voz del kernel territorial. Pregúntame por rutas, pastes, mineras, dichos o por la federación TAMV MD-X4." },
];

const SUGGEST = [
  "¿Qué hacer un fin de semana en Real del Monte?",
  "Cuéntame la historia del Panteón Inglés.",
  "¿Dónde como los mejores pastes?",
  "Explícame la heptafederación.",
];

function localAnswer(q: string): string {
  const t = q.toLowerCase();
  if (t.includes("paste")) return "Los pastes más reconocidos están en El Portal (tradicional cornish), Casa Minera (paste de mole) y Kiko's (versión dulce de piña). Recorre la Ruta del Paste en /rutas.";
  if (t.includes("panteón") || t.includes("ingl")) return "El Panteón Inglés (1851) es el único cementerio británico fuera del Reino Unido en territorio mexicano, orientado hacia Cornwall. Es parada obligada de la Ruta Cornish.";
  if (t.includes("federa") || t.includes("hepta") || t.includes("tamv")) return "La heptafederación TAMV MD-X4 articula 7 capas: Anubis (doctrina), MDD-TAMV (territorio), BookPi (conocimiento), Phoenix (comercio), Kaos (caos creador), Chronos (tiempo) y Dekateotl (decimación divina).";
  if (t.includes("fin de semana") || t.includes("hacer")) return "Te propongo: viernes Mina La Acosta + paste en El Portal; sábado tirolesa El Chico y Ruta Cornish; domingo café de olla y Mercado Hidalgo. Reserva el shuttle CDMX en /transporte.";
  if (t.includes("mina")) return "Mina La Acosta es museo de sitio con tiros del s. XIX. Mina Dolores conserva maquinaria cornish. Visítalas con guía certificado.";
  return "Estoy entrenándome con los corpus BookPi y MDD-TAMV. Mientras tanto, explora /atlas, /rutas o /historia para más respuestas curadas por el kernel.";
}

function RealitoPage() {
  const [msgs, setMsgs] = useState<Msg[]>(SEED);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), [msgs]);

  const send = (text?: string) => {
    const q = (text ?? input).trim();
    if (!q) return;
    setInput("");
    setMsgs((m) => [...m, { role: "user", content: q }]);
    setTimeout(() => setMsgs((m) => [...m, { role: "assistant", content: localAnswer(q) }]), 350);
  };

  return (
    <>
      <PageHero
        eyebrow="XII · Cognición"
        title="Realito AI"
        highlight="· voz del kernel."
        description="Asistente cognitivo entrenado en los corpus BookPi, MDD-TAMV y la memoria oral de la comarca."
      />
      <section className="container mx-auto px-6 pb-24">
        <div className="max-w-3xl mx-auto rounded-3xl border-hairline bg-card shadow-sovereign overflow-hidden">
          <div className="h-[480px] overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-background to-secondary/30">
            {msgs.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${m.role === "user" ? "bg-foreground text-background" : "bg-card border-hairline text-foreground"}`}>
                  {m.role === "assistant" && <Sparkles className="inline w-3 h-3 text-accent mr-1.5 -mt-0.5" />}
                  {m.content}
                </div>
              </div>
            ))}
            <div ref={endRef} />
          </div>
          <div className="border-t border-hairline p-4 bg-card">
            <div className="flex flex-wrap gap-1.5 mb-3">
              {SUGGEST.map((s) => (
                <button key={s} onClick={() => send(s)} className="text-[11px] font-mono px-2.5 py-1 rounded-full border-hairline hover:bg-secondary">{s}</button>
              ))}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Habla con el kernel…" className="flex-1 rounded-full border-hairline bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/40" />
              <button className="rounded-full bg-foreground text-background px-5"><Send className="w-4 h-4" /></button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
