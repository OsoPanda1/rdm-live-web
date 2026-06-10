import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Compass, Search, Mountain, Network, Scale } from "lucide-react";
import { openSearchOverlay } from "@/features/search/tourismIndex";

/**
 * CompassNav — Navegación tripartita flotante (Territorio · Ecosistema · Gobernanza).
 * NO reemplaza la RDMNavbar; complementa la experiencia con una brújula soberana
 * inferior que organiza las rutas existentes en 3 cuadrantes semánticos.
 *
 * Cada cuadrante despliega un panel glassmórfico con links a rutas ya registradas
 * en App.tsx — no se rompe ningún path.
 */

type QuadrantKey = "territorio" | "ecosistema" | "gobernanza";

interface QuadrantLink {
  to: string;
  label: string;
  hint?: string;
}

interface Quadrant {
  key: QuadrantKey;
  label: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  tone: string;
  links: QuadrantLink[];
}

const QUADRANTS: Quadrant[] = [
  {
    key: "territorio",
    label: "Territorio",
    icon: Mountain,
    tone: "hsl(var(--gold))",
    links: [
      { to: "/mapa", label: "Mapa vivo", hint: "POIs y rutas reales" },
      { to: "/rutas", label: "Rutas turísticas" },
      { to: "/historia", label: "Historia y minas" },
      { to: "/ecoturismo", label: "Naturaleza" },
      { to: "/patrimonio-cultural", label: "Patrimonio" },
      { to: "/atlas-maximus", label: "Atlas Maximus" },
    ],
  },
  {
    key: "ecosistema",
    label: "Ecosistema",
    icon: Network,
    tone: "hsl(var(--electric))",
    links: [
      { to: "/directorio", label: "Directorio de comercios" },
      { to: "/gastronomia", label: "Gastronomía / Pastes" },
      { to: "/comunidad", label: "Comunidad" },
      { to: "/eventos", label: "Eventos" },
      { to: "/relatos", label: "Leyendas" },
      { to: "/ecosistema-ltos", label: "Ecosistema LTOS" },
    ],
  },
  {
    key: "gobernanza",
    label: "Gobernanza",
    icon: Scale,
    tone: "hsl(var(--terracotta))",
    links: [
      { to: "/leaderboard", label: "Tabla de honor" },
      { to: "/perfil", label: "Mi perfil" },
      { to: "/gobernanza", label: "Gobernanza federada" },
      { to: "/arquitectura", label: "Arquitectura técnica" },
      { to: "/apoya", label: "Apoya el proyecto" },
    ],
  },
];

export default function CompassNav() {
  const [active, setActive] = useState<QuadrantKey | null>(null);
  const { pathname } = useLocation();

  return (
    <div className="pointer-events-none fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl px-4">
      <AnimatePresence>
        {active && (
          <motion.div
            key={active}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="pointer-events-auto mb-3 rounded-3xl glass-card border border-[hsl(var(--gold)/0.25)] shadow-premium overflow-hidden"
          >
            <div className="px-5 py-3 flex items-center justify-between border-b border-[hsl(var(--border))]">
              <span className="text-[10px] uppercase tracking-[0.22em] text-[hsl(var(--muted-foreground))]">
                {QUADRANTS.find((q) => q.key === active)?.label}
              </span>
              <button
                onClick={() => setActive(null)}
                className="text-[10px] uppercase tracking-widest text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
              >
                cerrar
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1 p-2">
              {QUADRANTS.find((q) => q.key === active)?.links.map((l) => {
                const isHere = pathname === l.to;
                return (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setActive(null)}
                    className={`rounded-2xl px-3 py-2.5 text-sm transition-colors ${
                      isHere
                        ? "bg-[hsl(var(--electric)/0.12)] text-[hsl(var(--electric))]"
                        : "hover:bg-[hsl(var(--muted)/0.6)] text-[hsl(var(--foreground))]"
                    }`}
                  >
                    <span className="block font-medium">{l.label}</span>
                    {l.hint && (
                      <span className="block text-[10px] text-[hsl(var(--muted-foreground))] mt-0.5">
                        {l.hint}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Brújula tripartita */}
      <motion.nav
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        className="pointer-events-auto flex items-stretch rounded-full glass-card border border-[hsl(var(--gold)/0.25)] shadow-premium overflow-hidden"
        aria-label="Brújula de navegación"
      >
        {QUADRANTS.map((q, i) => {
          const Icon = q.icon;
          const isActive = active === q.key;
          return (
            <button
              key={q.key}
              onClick={() => setActive((p) => (p === q.key ? null : q.key))}
              className={`relative flex-1 flex flex-col items-center justify-center py-2.5 px-2 transition-colors ${
                isActive ? "text-[hsl(var(--navy-dark))]" : "text-[hsl(var(--foreground)/0.8)] hover:text-[hsl(var(--foreground))]"
              } ${i > 0 ? "border-l border-[hsl(var(--border))]" : ""}`}
              aria-pressed={isActive}
              aria-label={q.label}
            >
              {isActive && (
                <motion.span
                  layoutId="compass-active"
                  className="absolute inset-y-1 inset-x-1 rounded-full"
                  style={{ background: `linear-gradient(135deg, ${q.tone}22, ${q.tone}10)` }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative flex items-center gap-1.5">
                <Icon className="h-4 w-4" style={{ color: q.tone }} />
                <span className="text-[11px] uppercase tracking-widest font-medium">{q.label}</span>
              </span>
            </button>
          );
        })}

        {/* Centro: búsqueda */}
        <button
          onClick={() => openSearchOverlay()}
          aria-label="Abrir búsqueda turística"
          className="relative flex items-center justify-center px-4 border-l border-[hsl(var(--border))] hover:bg-[hsl(var(--electric)/0.08)] transition-colors"
        >
          <span className="absolute inset-2 rounded-full magic-pulse" aria-hidden />
          <Search className="h-4 w-4 relative text-[hsl(var(--electric))]" />
          <span className="ml-2 hidden sm:inline text-[10px] uppercase tracking-widest text-[hsl(var(--muted-foreground))]">
            ⌘K
          </span>
        </button>
      </motion.nav>

      <div className="pointer-events-none mt-1 flex items-center justify-center gap-1 text-[9px] uppercase tracking-[0.3em] text-[hsl(var(--muted-foreground))]">
        <Compass className="h-3 w-3" />
        Brújula soberana RDM
      </div>
    </div>
  );
}
