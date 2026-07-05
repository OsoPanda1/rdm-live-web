import { createFileRoute } from "@tanstack/react-router";
import { HEPTA_LAYERS } from "@/lib/federation";
import data from "@/data/ltos-platforms.json";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { getTelemetryPulses } from "@/lib/telemetry.functions";
import { Suspense } from "react";

const pulsesQuery = queryOptions({
  queryKey: ["telemetry-pulses"],
  queryFn: () => getTelemetryPulses(),
});

export const Route = createFileRoute("/federacion")({
  head: () => ({
    meta: [
      { title: "Heptafederación TAMV MD-X4 · RDM Digital" },
      { name: "description", content: "Las siete capas del Kernel Heptafederado: ANUBIS, MDD-TAMV, BookPi, Phoenix, Kaos, Chronos, Dekateotl." },
      { property: "og:title", content: "Heptafederación TAMV MD-X4" },
      { property: "og:description", content: "Doctrina, territorio, conocimiento, comercio, caos, tiempo, decimación." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(pulsesQuery),
  component: FederationPage,
});

function FederationPage() {
  return (
    <section className="container mx-auto px-6 py-16">
      <div className="max-w-3xl">
        <div className="font-mono text-[10px] tracking-sovereign text-accent mb-3">III · Kernel</div>
        <h1 className="font-display text-5xl md:text-6xl text-ink">Heptafederación <span className="text-gradient-copper italic">TAMV MD-X4</span></h1>
        <p className="mt-4 text-muted-foreground">Siete capas ontológicas que gobiernan la ejecución técnica del territorio. Cada una posee un dominio, un mantra y una huella telemétrica.</p>
      </div>

      <div className="mt-12 grid md:grid-cols-2 gap-5">
        {HEPTA_LAYERS.map((l, idx) => {
          const linkedPlatforms = data.platforms.filter((p) => p.federation === l.key);
          return (
            <article key={l.key} className="relative rounded-3xl border-hairline bg-card p-7 overflow-hidden">
              <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl opacity-30" style={{ background: l.color }} />
              <div className="relative flex items-start gap-5">
                <div className="text-6xl font-display" style={{ color: l.color }}>{l.glyph}</div>
                <div className="flex-1">
                  <div className="font-mono text-[10px] tracking-sovereign text-muted-foreground">Capa {String(idx + 1).padStart(2, "0")} · {l.key}</div>
                  <h2 className="font-display text-3xl text-ink mt-1">{l.name}</h2>
                  <div className="text-sm text-foreground mt-1">{l.domain}</div>
                  <p className="italic text-muted-foreground mt-3 text-sm">"{l.mantra}"</p>
                  <div className="mt-4 pt-4 border-t border-hairline">
                    <div className="text-[10px] font-mono tracking-sovereign text-muted-foreground mb-2">Plataformas federadas</div>
                    {linkedPlatforms.length ? (
                      <ul className="text-xs text-foreground space-y-0.5">
                        {linkedPlatforms.map((p) => (<li key={p.slug}>· {p.name}</li>))}
                      </ul>
                    ) : <div className="text-xs text-muted-foreground">— sin nodos asignados —</div>}
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-20">
        <div className="font-mono text-[10px] tracking-sovereign text-accent mb-2">IV · Pulsos en vivo</div>
        <h2 className="font-display text-4xl text-ink">Telemetría federada</h2>
        <Suspense fallback={<div className="mt-6 text-muted-foreground">Sincronizando pulsos…</div>}>
          <TelemetryTable />
        </Suspense>
      </div>
    </section>
  );
}

function TelemetryTable() {
  const { data: q } = useSuspenseQuery(pulsesQuery);
  return (
    <div className="mt-6 rounded-2xl border-hairline bg-card overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-secondary/50">
          <tr className="text-left font-mono text-[10px] tracking-sovereign text-muted-foreground">
            <th className="px-4 py-3">Federación</th>
            <th className="px-4 py-3">Pulso</th>
            <th className="px-4 py-3 text-right">Valor</th>
            <th className="px-4 py-3 text-right">Hora</th>
          </tr>
        </thead>
        <tbody>
          {q.pulses.map((p) => {
            const layer = HEPTA_LAYERS.find((l) => l.key === p.federation);
            return (
              <tr key={p.id} className="border-t border-hairline">
                <td className="px-4 py-3"><span className="font-mono text-[10px] tracking-sovereign px-2 py-1 rounded-full" style={{ background: `${layer?.color ?? "#999"}22`, color: layer?.color }}>{p.federation}</span></td>
                <td className="px-4 py-3 text-foreground">{p.pulse_type}</td>
                <td className="px-4 py-3 text-right font-display text-lg">{Number(p.value)}</td>
                <td className="px-4 py-3 text-right text-xs text-muted-foreground">{new Date(p.created_at).toLocaleString("es-MX")}</td>
              </tr>
            );
          })}
          {!q.pulses.length && <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">Sin pulsos registrados.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
