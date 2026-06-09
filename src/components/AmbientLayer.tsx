import { useEffect } from "react";

/**
 * AmbientLayer — Capa atmosférica global absorbida de
 * rdm-digital-nodo-cero + real-del-monte-elevated.
 *
 * Tres capas pasivas (pointer-events: none) sobre toda la app:
 *   1. Aurora viva (gradientes radiales que respiran).
 *   2. Grano cinematográfico (noise SVG, mix-blend overlay).
 *   3. Aura sutil siguiendo el cursor (--mx / --my).
 *
 * Se monta una vez en App.tsx y todo el ecosistema turístico
 * hereda la atmósfera mágica sin tocar layouts existentes.
 */
export default function AmbientLayer() {
  useEffect(() => {
    const root = document.documentElement;
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        root.style.setProperty("--mx", `${e.clientX}px`);
        root.style.setProperty("--my", `${e.clientY}px`);
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    root.classList.add("cursor-ambient");
    return () => {
      window.removeEventListener("pointermove", onMove);
      root.classList.remove("cursor-ambient");
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 aurora-bg opacity-90" />
      <div className="absolute inset-0 grid-paper-fine opacity-60" />
      <div className="absolute inset-0 noise-overlay" />
    </div>
  );
}
