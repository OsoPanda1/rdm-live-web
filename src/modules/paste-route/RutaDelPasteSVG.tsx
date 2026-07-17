import { useRef, useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Star, X, ZoomIn, ZoomOut, RotateCcw, Loader2, MessageSquarePlus } from "lucide-react";
import { usePasteRoute, type PastePoi } from "./usePasteRoute";
import RatingModal from "./RatingModal";

const TYPE_COLOR: Record<string, string> = {
  pasteria: "#D4AF37",
  mirador: "#7DD3FC",
  mina: "#C97B4A",
  plaza: "#A78BFA",
  museo: "#F472B6",
  memorial: "#94A3B8",
};

function buildPath(pois: PastePoi[]): string {
  if (pois.length === 0) return "";
  const pts = pois.map((p) => `${p.svg_x} ${p.svg_y}`);
  return `M ${pts[0]} ` + pts.slice(1).map((p, i) => (i === 0 ? `Q ${p}` : `T ${p}`)).join(" ");
}

export default function RutaDelPasteSVG() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const { pois, loading, error, reload } = usePasteRoute();
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const [drag, setDrag] = useState<{ x: number; y: number; tx: number; ty: number } | null>(null);
  const [selected, setSelected] = useState<PastePoi | null>(null);
  const [rateOpen, setRateOpen] = useState(false);

  const reset = () => { setScale(1); setTx(0); setTy(0); };
  const zoom = (delta: number, cx?: number, cy?: number) => {
    setScale((s) => {
      const ns = Math.min(3.5, Math.max(0.7, s + delta));
      if (cx != null && cy != null) {
        const k = ns / s;
        setTx((p) => cx - (cx - p) * k);
        setTy((p) => cy - (cy - p) * k);
      }
      return ns;
    });
  };

  const onWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    zoom(e.deltaY > 0 ? -0.15 : 0.15, e.clientX - rect.left, e.clientY - rect.top);
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [onWheel]);

  const path = buildPath(pois);

  return (
    <div className="relative">
      <div
        ref={wrapRef}
        className="relative overflow-hidden rounded-2xl border border-gold/20 bg-gradient-to-br from-navy-dark via-navy to-charcoal aspect-[5/3] cursor-grab active:cursor-grabbing"
        onMouseDown={(e) => setDrag({ x: e.clientX, y: e.clientY, tx, ty })}
        onMouseMove={(e) => { if (drag) { setTx(drag.tx + (e.clientX - drag.x)); setTy(drag.ty + (e.clientY - drag.y)); } }}
        onMouseUp={() => setDrag(null)}
        onMouseLeave={() => setDrag(null)}
      >
        <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "linear-gradient(hsl(var(--gold)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--gold)) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center text-gold">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center text-red-400 text-xs font-mono px-4 text-center">{error}</div>
        )}

        <svg viewBox="0 0 1000 600" className="absolute inset-0 w-full h-full"
          style={{ transform: `translate(${tx}px, ${ty}px) scale(${scale})`, transformOrigin: "0 0", transition: drag ? "none" : "transform 0.2s ease-out" }}>
          <defs>
            <linearGradient id="route-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#C97B4A" stopOpacity="0.9" />
            </linearGradient>
            <filter id="glow"><feGaussianBlur stdDeviation="3" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          </defs>
          <path d="M 0 500 Q 200 420 400 460 T 800 440 L 1000 480 L 1000 600 L 0 600 Z" fill="hsl(var(--forest))" opacity="0.25" />
          <path d="M 0 540 Q 250 480 500 510 T 1000 520 L 1000 600 L 0 600 Z" fill="hsl(var(--forest))" opacity="0.4" />
          {path && <>
            <path d={path} fill="none" stroke="url(#route-grad)" strokeWidth="5" strokeDasharray="10 6" filter="url(#glow)" strokeLinecap="round" />
            <path d={path} fill="none" stroke="#fff" strokeWidth="1" opacity="0.3" strokeLinecap="round" />
          </>}
          {pois.map((p, i) => {
            const color = TYPE_COLOR[p.type] ?? "#D4AF37";
            return (
              <g key={p.id} className="cursor-pointer" onClick={(e) => { e.stopPropagation(); setSelected(p); }}>
                <circle cx={p.svg_x} cy={p.svg_y} r="22" fill={color} opacity="0.18" />
                <circle cx={p.svg_x} cy={p.svg_y} r="14" fill={color} stroke="#fff" strokeWidth="2" filter="url(#glow)" />
                <text x={p.svg_x} y={p.svg_y + 4} textAnchor="middle" fontSize="12" fontWeight="700" fill="#0d0d0d">{i + 1}</text>
                <text x={p.svg_x} y={p.svg_y - 24} textAnchor="middle" fontSize="11" fill="#f0d78c" fontFamily="'Cormorant Garamond', serif" fontStyle="italic">{p.name}</text>
                {p.rating_count > 0 && (
                  <text x={p.svg_x} y={p.svg_y + 34} textAnchor="middle" fontSize="9" fill="#D4AF37" fontFamily="monospace">★ {p.avg_rating} ({p.rating_count})</text>
                )}
              </g>
            );
          })}
        </svg>

        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
          <button onClick={() => zoom(0.25)} className="h-9 w-9 rounded-lg bg-navy-dark/80 backdrop-blur border border-gold/30 text-gold hover:bg-gold/10 flex items-center justify-center"><ZoomIn className="h-4 w-4" /></button>
          <button onClick={() => zoom(-0.25)} className="h-9 w-9 rounded-lg bg-navy-dark/80 backdrop-blur border border-gold/30 text-gold hover:bg-gold/10 flex items-center justify-center"><ZoomOut className="h-4 w-4" /></button>
          <button onClick={reset} className="h-9 w-9 rounded-lg bg-navy-dark/80 backdrop-blur border border-gold/30 text-gold hover:bg-gold/10 flex items-center justify-center"><RotateCcw className="h-4 w-4" /></button>
        </div>

        <div className="absolute bottom-3 left-3 flex flex-wrap gap-2 text-[10px] font-mono uppercase tracking-wider">
          {Array.from(new Set(pois.map((p) => p.type))).map((k) => (
            <span key={k} className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-navy-dark/70 backdrop-blur border border-border/30 text-platinum/80">
              <span className="h-2 w-2 rounded-full" style={{ background: TYPE_COLOR[k] ?? "#D4AF37" }} /> {k}
            </span>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}
            className="mt-4 rounded-2xl border border-gold/25 bg-gradient-to-br from-navy-dark/95 to-charcoal/95 p-5 backdrop-blur-xl">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="h-2 w-2 rounded-full" style={{ background: TYPE_COLOR[selected.type] ?? "#D4AF37" }} />
                  <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-gold/70">{selected.type}</span>
                </div>
                <h3 className="font-display text-2xl text-platinum">{selected.icon} {selected.name}</h3>
                <p className="mt-2 text-sm font-body text-muted-foreground">{selected.description}</p>
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-platinum/75">
                  <span className="inline-flex items-center gap-1"><Star className="h-3 w-3 text-gold fill-gold" /> {selected.avg_rating} ({selected.rating_count} reseñas)</span>
                  <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3 text-gold" /> Real del Monte</span>
                </div>
                <button onClick={() => setRateOpen(true)} className="mt-4 inline-flex items-center gap-2 rounded-xl border border-gold/40 bg-gold/10 text-gold px-4 py-2 text-xs font-semibold hover:bg-gold/15 transition-all">
                  <MessageSquarePlus className="h-3.5 w-3.5" /> Calificar este lugar
                </button>
              </div>
              <button onClick={() => setSelected(null)} className="h-8 w-8 rounded-full bg-border/30 hover:bg-border/50 flex items-center justify-center text-platinum"><X className="h-4 w-4" /></button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {rateOpen && selected && (
          <RatingModal poiId={selected.id} poiName={selected.name} onClose={() => setRateOpen(false)} onSaved={reload} />
        )}
      </AnimatePresence>
    </div>
  );
}
