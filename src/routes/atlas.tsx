import { createFileRoute } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { HEPTA_LAYERS } from "@/lib/federation";

// Real del Monte aprox bbox
const NODES = [
  { id: "nodo-cero", name: "Nodo Cero · Plaza Principal", lat: 20.143, lon: -98.668, fed: "ANUBIS" },
  { id: "panteon-ingles", name: "Panteón Inglés", lat: 20.148, lon: -98.671, fed: "CHRONOS" },
  { id: "mina-acosta", name: "Mina La Acosta", lat: 20.139, lon: -98.674, fed: "KAOS" },
  { id: "iglesia-veracruz", name: "Iglesia Veracruz", lat: 20.141, lon: -98.667, fed: "BOOKPI" },
  { id: "mercado", name: "Mercado Soberano", lat: 20.144, lon: -98.664, fed: "PHOENIX" },
  { id: "puente-mineros", name: "Puente Los Mineros", lat: 20.137, lon: -98.669, fed: "MDD_TAMV" },
  { id: "ipfs-anchor", name: "Anclaje IPFS · Cerro El Hiloche", lat: 20.151, lon: -98.66, fed: "DEKATEOTL" },
] as const;

export const Route = createFileRoute("/atlas")({
  head: () => ({
    meta: [
      { title: "Atlas Territorial · Gemelo Digital · RDM" },
      { name: "description", content: "Cartografía soberana de Real del Monte con nodos federados georeferenciados." },
      { property: "og:title", content: "Atlas Territorial · RDM Digital" },
    ],
  }),
  component: AtlasPage,
});

function AtlasPage() {
  // normalize to SVG coords
  const minLat = 20.135, maxLat = 20.155, minLon = -98.68, maxLon = -98.658;
  const W = 800, H = 600;
  const proj = (lat: number, lon: number) => ({
    x: ((lon - minLon) / (maxLon - minLon)) * W,
    y: H - ((lat - minLat) / (maxLat - minLat)) * H,
  });

  return (
    <section className="container mx-auto px-6 py-16">
      <div className="grid lg:grid-cols-[1fr_320px] gap-8">
        <div>
          <div className="font-mono text-[10px] tracking-sovereign text-accent mb-3">II · Atlas</div>
          <h1 className="font-display text-5xl md:text-6xl text-ink">Atlas <span className="text-gradient-copper italic">Territorial</span></h1>
          <p className="mt-3 text-muted-foreground max-w-xl">Gemelo digital cartográfico de Real del Monte, Hidalgo. Cada nodo es un punto soberano del kernel territorial, anclado a una capa heptafederada.</p>

          <div className="mt-8 relative rounded-3xl border-hairline overflow-hidden bg-paper shadow-sovereign grain">
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M40 0H0V40" fill="none" stroke="currentColor" strokeOpacity="0.06" />
                </pattern>
                <radialGradient id="glow">
                  <stop offset="0%" stopColor="oklch(0.66 0.16 45)" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="oklch(0.66 0.16 45)" stopOpacity="0" />
                </radialGradient>
              </defs>
              <rect width={W} height={H} fill="url(#grid)" />
              {/* contour-ish */}
              <g stroke="oklch(0.55 0.08 220)" strokeOpacity="0.15" fill="none">
                {[80, 140, 200, 260, 320].map((r) => (
                  <ellipse key={r} cx={W * 0.55} cy={H * 0.55} rx={r * 1.4} ry={r * 0.9} />
                ))}
              </g>
              {/* connecting lines */}
              <g stroke="oklch(0.5 0.05 260)" strokeOpacity="0.25" strokeWidth="1" strokeDasharray="3 4">
                {NODES.map((n, i) => {
                  const a = proj(n.lat, n.lon);
                  const next = NODES[(i + 1) % NODES.length];
                  const b = proj(next.lat, next.lon);
                  return <line key={n.id} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />;
                })}
              </g>
              {NODES.map((n) => {
                const { x, y } = proj(n.lat, n.lon);
                const color = HEPTA_LAYERS.find((l) => l.key === n.fed)?.color ?? "#888";
                return (
                  <g key={n.id}>
                    <circle cx={x} cy={y} r="40" fill="url(#glow)" />
                    <circle cx={x} cy={y} r="6" fill={color} />
                    <circle cx={x} cy={y} r="11" fill="none" stroke={color} strokeOpacity="0.5" />
                    <text x={x + 14} y={y + 4} fontSize="11" fill="oklch(0.22 0.035 255)" fontFamily="DM Sans">{n.name}</text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        <aside className="space-y-3">
          <div className="font-mono text-[10px] tracking-sovereign text-muted-foreground">Nodos federados</div>
          {NODES.map((n) => {
            const color = HEPTA_LAYERS.find((l) => l.key === n.fed)?.color ?? "#888";
            return (
              <div key={n.id} className="rounded-2xl border-hairline bg-card p-4 flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color }} />
                <div className="flex-1 min-w-0">
                  <div className="font-display text-sm text-ink truncate">{n.name}</div>
                  <div className="font-mono text-[10px] tracking-sovereign mt-1" style={{ color }}>{n.fed}</div>
                  <div className="font-mono text-[10px] text-muted-foreground mt-1">{n.lat.toFixed(4)}, {n.lon.toFixed(4)}</div>
                </div>
              </div>
            );
          })}
        </aside>
      </div>
    </section>
  );
}
