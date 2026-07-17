import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "rdm.intro.seen.v2";

const FEDERATION_LABELS = [
  { name: "ANUBIS", color: "#6366f1" },
  { name: "MDD-TAMV", color: "#06b6d4" },
  { name: "BOOKPI", color: "#eab308" },
  { name: "PHOENIX", color: "#f97316" },
  { name: "KAOS", color: "#ec4899" },
  { name: "CHRONOS", color: "#14b8a6" },
  { name: "DEKATEOTL", color: "#22c55e" },
];

export function CinematicIntro() {
  const [visible, setVisible] = useState(false);
  const [phase, setPhase] = useState<0 | 1 | 2 | 3 | 4>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  // Phase progression
  useEffect(() => {
    if (!visible) return;
    const timers = [
      setTimeout(() => setPhase(1), 600),
      setTimeout(() => setPhase(2), 2200),
      setTimeout(() => setPhase(3), 5500),
      setTimeout(() => setPhase(4), 8500),
    ];
    return () => timers.forEach(clearTimeout);
  }, [visible]);

  // Three.js-like canvas animation
  useEffect(() => {
    if (!visible || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = (canvas.width = window.innerWidth);
    const h = (canvas.height = window.innerHeight);

    interface Particle {
      x: number; y: number; z: number;
      vx: number; vy: number; vz: number;
      size: number; alpha: number; color: string;
    }

    const particles: Particle[] = [];
    for (let i = 0; i < 3000; i++) {
      particles.push({
        x: (Math.random() - 0.5) * w * 2,
        y: (Math.random() - 0.5) * h * 2,
        z: Math.random() * 1000,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.3,
        vz: -Math.random() * 2,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.5 + 0.1,
        color: FEDERATION_LABELS[Math.floor(Math.random() * 7)].color,
      });
    }

    let mouseX = w / 2;
    let mouseY = h / 2;
    const handleMouse = (e: MouseEvent) => { mouseX = e.clientX; mouseY = e.clientY; };
    canvas.addEventListener("mousemove", handleMouse);

    let time = 0;
    const draw = () => {
      time += 0.016;
      ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
      ctx.fillRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        if (p.z < 1) { p.z = 1000; p.x = (Math.random() - 0.5) * w * 2; p.y = (Math.random() - 0.5) * h * 2; }
        if (Math.abs(p.x) > w) p.vx *= -1;
        if (Math.abs(p.y) > h) p.vy *= -1;

        const perspective = 800 / p.z;
        const sx = cx + p.x * perspective;
        const sy = cy + p.y * perspective;

        const dx = sx - mouseX;
        const dy = sy - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const influence = Math.max(0, 1 - dist / 200);

        ctx.beginPath();
        ctx.arc(sx, sy, p.size * perspective * (1 + influence * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha * perspective * (0.5 + influence * 0.5);
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // Draw federation rings (phase 2+)
      if (phase >= 2) {
        const ringOpacity = Math.min(1, (phase === 2 ? 0.3 : 0.6));
        FEDERATION_LABELS.forEach((fed, i) => {
          const angle = (i / 7) * Math.PI * 2 + time * 0.3;
          const radius = 150 + Math.sin(time + i) * 20;
          const rx = cx + Math.cos(angle) * radius;
          const ry = cy + Math.sin(angle) * radius * 0.4;

          ctx.beginPath();
          ctx.arc(rx, ry, 8, 0, Math.PI * 2);
          ctx.fillStyle = fed.color;
          ctx.globalAlpha = ringOpacity;
          ctx.fill();
          ctx.globalAlpha = 1;

          // Connect to center
          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(rx, ry);
          ctx.strokeStyle = fed.color;
          ctx.globalAlpha = ringOpacity * 0.3;
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.globalAlpha = 1;
        });

        // Center pulse
        const pulseRadius = 12 + Math.sin(time * 2) * 4;
        ctx.beginPath();
        ctx.arc(cx, cy, pulseRadius, 0, Math.PI * 2);
        ctx.fillStyle = "oklch(0.66 0.16 45)";
        ctx.globalAlpha = ringOpacity * 0.8;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      animRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animRef.current);
      canvas.removeEventListener("mousemove", handleMouse);
    };
  }, [visible, phase]);

  const dismiss = () => {
    setPhase(0);
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch { /* noop */ }
    setTimeout(() => setVisible(false), 1200);
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="nodo-cero-intro"
        className="fixed inset-0 z-[100]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.2 }}
      >
        {/* Background canvas */}
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full bg-black" />

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />

        {/* Phase 0-1: Silencio / Pulso */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase >= 1 && phase < 4 ? 1 : 0 }}
          transition={{ duration: 1.5 }}
        >
          <div className="text-center px-6">
            <motion.div
              className="font-mono text-[10px] tracking-[0.5em] uppercase text-amber-400/80 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: phase >= 1 ? 1 : 0, y: phase >= 1 ? 0 : 20 }}
              transition={{ duration: 1, delay: 0.3 }}
            >
              Real del Monte · Nodo Cero
            </motion.div>

            <motion.h1
              className="font-display text-4xl md:text-6xl lg:text-8xl text-white leading-[0.95]"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: phase >= 1 ? 1 : 0, y: phase >= 1 ? 0 : 40 }}
              transition={{ duration: 1.2, delay: 0.6 }}
            >
              <span className="text-gradient-copper italic">El Despertar</span>
              <br />
              <span className="text-white/90">de la Niebla</span>
            </motion.h1>

            <motion.p
              className="mt-6 text-lg md:text-xl text-white/60 max-w-2xl mx-auto font-body"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: phase >= 2 ? 0.8 : 0, y: phase >= 2 ? 0 : 20 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              Cuando todo era niebla, alguien decidió ver código en la roca.
            </motion.p>
          </div>
        </motion.div>

        {/* Phase 2: Federation labels */}
        <motion.div
          className="absolute bottom-32 left-0 right-0 flex justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase >= 2 && phase < 4 ? 1 : 0 }}
          transition={{ duration: 1 }}
        >
          <div className="flex flex-wrap justify-center gap-3 px-6">
            {FEDERATION_LABELS.map((fed, i) => (
              <motion.span
                key={fed.name}
                className="font-mono text-[10px] tracking-widest px-3 py-1.5 rounded-full border"
                style={{ borderColor: fed.color + "60", color: fed.color }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: phase >= 2 ? 1 : 0, scale: phase >= 2 ? 1 : 0.8 }}
                transition={{ delay: 0.1 * i, duration: 0.5 }}
              >
                {fed.name}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* Phase 3: Manifesto text */}
        <motion.div
          className="absolute inset-x-0 top-1/3 flex justify-center pointer-events-none px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase >= 3 && phase < 4 ? 1 : 0 }}
          transition={{ duration: 1 }}
        >
          <div className="max-w-2xl text-center">
            <motion.p
              className="text-xl md:text-2xl text-white/70 font-display italic leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: phase >= 3 ? 1 : 0, y: phase >= 3 ? 0 : 30 }}
              transition={{ duration: 1.2, delay: 0.3 }}
            >
              23,000 horas no son un sistema.
              <br />
              Son una vida puesta sobre la mesa
              <br />
              para que un pueblo tenga cerebro digital propio.
            </motion.p>

            <motion.div
              className="mt-8 flex flex-wrap justify-center gap-4 text-[11px] font-mono tracking-[0.3em] uppercase"
              initial={{ opacity: 0 }}
              animate={{ opacity: phase >= 3 ? 0.7 : 0 }}
              transition={{ duration: 1, delay: 0.8 }}
            >
              <span className="text-amber-400">Soberanía Digital</span>
              <span className="text-white/30">·</span>
              <span className="text-cyan-400">Memoria Minera</span>
              <span className="text-white/30">·</span>
              <span className="text-emerald-400">Sistema Civilizatorio Local</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Phase 4: Final CTA + Dismiss */}
        <motion.div
          className="absolute inset-x-0 bottom-0 flex flex-col items-center pb-16 pointer-events-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: phase >= 4 ? 1 : 0, y: phase >= 4 ? 0 : 40 }}
          transition={{ duration: 1 }}
        >
          <motion.p
            className="text-sm text-white/50 mb-6 font-body max-w-md text-center px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase >= 4 ? 0.8 : 0 }}
            transition={{ delay: 0.5 }}
          >
            "El dueño de tu historia eres tú. Bienvenido al Nodo Cero."
          </motion.p>

          <motion.button
            type="button"
            onClick={dismiss}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center justify-center rounded-full border border-amber-400/60 bg-black/50 px-8 py-3.5 text-sm font-medium text-white shadow-[0_0_30px_rgba(251,191,36,0.25)] backdrop-blur-lg transition-colors hover:bg-black/70"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: phase >= 4 ? 1 : 0, y: phase >= 4 ? 0 : 20 }}
            transition={{ delay: 0.8 }}
          >
            Entrar al Nodo Cero
          </motion.button>

          <button
            type="button"
            onClick={dismiss}
            className="mt-4 text-[11px] text-white/30 hover:text-white/60 tracking-widest uppercase transition-colors"
          >
            Saltar intro
          </button>

          {/* Bottom waveform */}
          <motion.div
            className="mt-8 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase >= 4 ? 0.4 : 0 }}
            transition={{ delay: 1.2 }}
          >
            <svg viewBox="0 0 600 40" className="w-48 h-8 text-amber-400">
              <motion.path
                d="M0 20 L20 20 L30 10 L40 30 L50 20 L80 20 L95 5 L110 35 L125 20 L155 20 L170 12 L185 28 L200 20 L230 20 L245 8 L260 32 L275 20 L310 20 L325 14 L340 26 L355 20 L390 20 L405 6 L420 34 L435 20 L470 20 L485 10 L500 30 L515 20 L560 20 L575 12 L590 28 L600 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: phase >= 4 ? 1 : 0 }}
                transition={{ duration: 2, ease: "easeInOut" }}
              />
            </svg>
          </motion.div>
        </motion.div>

        {/* Top-right badge */}
        <motion.div
          className="absolute top-6 right-6 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase >= 1 && phase < 4 ? 0.5 : 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="font-mono text-[9px] tracking-widest text-white/40 text-right">
            LTOS v1.0<br />
            Heptafederación TAMV MD-X4
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
