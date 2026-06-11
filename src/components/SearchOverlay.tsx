import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Search, X, MapPin, BookOpen, Pickaxe, Utensils, Compass, Sparkles } from "lucide-react";
import {
  searchTourism,
  SEARCH_OPEN_EVENT,
  type SearchHit,
  type SearchHitKind,
} from "@/features/search/tourismIndex";

const KIND_ICONS: Record<SearchHitKind, React.ComponentType<{ className?: string }>> = {
  poi: MapPin,
  capitulo: BookOpen,
  mina: Pickaxe,
  paste: Utensils,
  ruta: Compass,
  leyenda: Sparkles,
};

const KIND_LABELS: Record<SearchHitKind, string> = {
  poi: "Lugar",
  capitulo: "Capítulo",
  mina: "Mina",
  paste: "Paste",
  ruta: "Ruta",
  leyenda: "Leyenda",
};

/**
 * SearchOverlay — buscador inmersivo full-screen.
 * Se abre con ⌘/Ctrl+K o con `openSearchOverlay()`.
 * Sugerencias instantáneas tipadas, agrupadas, con preview narrativo
 * y deep-link a `/mapa?poi=...` para anclar POIs en el mapa territorial.
 */
export default function SearchOverlay() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastFocusRef = useRef<HTMLElement | null>(null);
  const navigate = useNavigate();

  const hits = useMemo(() => searchTourism(query, 24), [query]);

  // Keyboard: open with ⌘/Ctrl+K, close with Esc
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape" && open) {
        e.preventDefault();
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    const opener = () => setOpen(true);
    window.addEventListener(SEARCH_OPEN_EVENT, opener);
    return () => {
      window.removeEventListener("keydown", handler);
      window.removeEventListener(SEARCH_OPEN_EVENT, opener);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      lastFocusRef.current = (document.activeElement as HTMLElement) ?? null;
      setQuery("");
      setCursor(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      lastFocusRef.current?.focus?.();
    }
  }, [open]);

  useEffect(() => setCursor(0), [query]);

  const go = (hit: SearchHit) => {
    setOpen(false);
    navigate(hit.href);
  };

  const onKeyNav = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setCursor((c) => Math.min(c + 1, hits.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setCursor((c) => Math.max(c - 1, 0));
    } else if (e.key === "Enter" && hits[cursor]) {
      go(hits[cursor]);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[120] flex items-start justify-center px-4 pt-[8vh]"
          role="dialog"
          aria-modal="true"
          aria-label="Búsqueda turística"
        >
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Cerrar búsqueda"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-[hsl(var(--navy-dark)/0.72)] backdrop-blur-2xl"
          />

          <motion.div
            initial={{ y: -18, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -8, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="relative w-full max-w-2xl rounded-3xl border border-[hsl(var(--gold)/0.25)] glass-card shadow-premium overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-[hsl(var(--border))]">
              <Search className="h-5 w-5 text-[hsl(var(--electric))]" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyNav}
                placeholder="Busca minas, pastes, leyendas, plazas, rutas…"
                className="flex-1 bg-transparent text-base outline-none placeholder:text-[hsl(var(--muted-foreground))]"
                role="combobox"
                aria-expanded={hits.length > 0}
                aria-controls="search-overlay-listbox"
                aria-activedescendant={hits[cursor] ? `search-hit-${hits[cursor].id}` : undefined}
                aria-autocomplete="list"
              />
              <kbd className="hidden sm:inline-flex text-[10px] tracking-widest uppercase px-2 py-1 rounded border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))]">
                Esc
              </kbd>
              <button
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
                className="p-1.5 rounded-lg hover:bg-[hsl(var(--muted))]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Results */}
            <div
              id="search-overlay-listbox"
              role="listbox"
              aria-label="Resultados de búsqueda"
              className="max-h-[60vh] overflow-y-auto py-2"
            >
              {hits.length === 0 && (
                <div className="px-6 py-10 text-center text-sm text-[hsl(var(--muted-foreground))]">
                  Sin resultados para «{query}». Prueba con <em>paste</em>, <em>Acosta</em> o <em>panteón</em>.
                </div>
              )}
              {hits.map((hit, i) => {
                const Icon = KIND_ICONS[hit.kind];
                const active = i === cursor;
                return (
                  <button
                    key={hit.id}
                    id={`search-hit-${hit.id}`}
                    role="option"
                    aria-selected={active}
                    onMouseEnter={() => setCursor(i)}
                    onClick={() => go(hit)}
                    className={`group w-full text-left flex items-start gap-3 px-5 py-3 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--electric))] ${
                      active ? "bg-[hsl(var(--electric)/0.08)]" : "hover:bg-[hsl(var(--muted)/0.5)]"
                    }`}
                  >
                    <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-[hsl(var(--navy)/0.06)] border border-[hsl(var(--border))]">
                      <Icon className="h-4 w-4 text-[hsl(var(--electric))]" />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">{hit.title}</span>
                        <span className="text-[9px] uppercase tracking-widest px-1.5 py-0.5 rounded-full bg-[hsl(var(--gold)/0.12)] text-[hsl(var(--gold-dark))]">
                          {KIND_LABELS[hit.kind]}
                        </span>
                      </span>
                      <span className="block text-[11px] text-[hsl(var(--muted-foreground))] mt-0.5 truncate">
                        {hit.subtitle}
                      </span>
                      <span className="block text-xs text-[hsl(var(--foreground)/0.7)] mt-1 line-clamp-2">
                        {hit.narrative}
                      </span>
                    </span>
                    {hit.lat && (
                      <span className="text-[10px] text-[hsl(var(--muted-foreground))] mt-1 shrink-0">
                        {hit.lat.toFixed(3)}, {hit.lng?.toFixed(3)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between px-5 py-2.5 border-t border-[hsl(var(--border))] text-[10px] uppercase tracking-widest text-[hsl(var(--muted-foreground))]">
              <span>↑↓ navegar · ↵ abrir</span>
              <span>RDM · Búsqueda territorial viva</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
