import { useEffect, useState } from "react";

/**
 * LiveTelemetryBadge — chip flotante "RDM·OS · LIVE"
 * absorbido del patrón Realito Orb de rdm-digital-nodo-cero.
 *
 * Refuerza la narrativa de sistema operativo territorial vivo:
 * heartbeat + reloj local + estado heptafederado.
 */
export default function LiveTelemetryBadge() {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hh = String(time.getHours()).padStart(2, "0");
  const mm = String(time.getMinutes()).padStart(2, "0");
  const ss = String(time.getSeconds()).padStart(2, "0");

  return (
    <div
      role="status"
      aria-label="Sistema RDM OS en línea"
      className="fixed bottom-4 left-4 z-40 hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full
                 bg-background/60 backdrop-blur-xl border border-border/50 shadow-soft
                 text-[10px] font-mono tracking-[0.18em] uppercase text-muted-foreground
                 hover:text-foreground transition-colors"
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full rounded-full bg-[hsl(var(--gold))] opacity-60 magic-pulse" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-[hsl(var(--gold))]" />
      </span>
      <span className="text-foreground/80">RDM·OS</span>
      <span className="opacity-50">·</span>
      <span>Heptafed</span>
      <span className="opacity-50">·</span>
      <span className="text-[hsl(var(--electric))]">{hh}:{mm}:{ss}</span>
    </div>
  );
}
