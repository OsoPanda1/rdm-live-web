import { lazy, Suspense, useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

const RealitoChat = lazy(() => import("@/components/RealitoChat"));

/* Canvas orb animado — esfera 3D pulsante que reemplaza el boton simple */
function OrbButton({ onClick }: { onClick: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const size = 64;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    let t = 0;
    let isVisible = document.visibilityState === "visible";
    let isIntersecting = true;

    const stop = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
    };

    const draw = () => {
      if (!isVisible || !isIntersecting) {
        rafRef.current = 0;
        return;
      }

      rafRef.current = requestAnimationFrame(draw);
      t += 0.02;
      ctx.clearRect(0, 0, size, size);

      const cx = size / 2;
      const cy = size / 2;
      const pulse = 1 + Math.sin(t * 1.5) * 0.04;
      const radius = 22 * pulse;

      // Outer glow
      const glowRadius = radius + 8 + Math.sin(t * 0.8) * 4;
      const grad = ctx.createRadialGradient(cx, cy, radius * 0.3, cx, cy, glowRadius);
      grad.addColorStop(0, "rgba(255,255,255,0.05)");
      grad.addColorStop(0.5, "rgba(59,213,255,0.08)");
      grad.addColorStop(1, "rgba(59,213,255,0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      // Orb body — gradient sphere
      const bodyGrad = ctx.createRadialGradient(cx - 8, cy - 8, 2, cx, cy, radius);
      bodyGrad.addColorStop(0, "rgba(100, 230, 255, 1)");
      bodyGrad.addColorStop(0.3, "rgba(59, 213, 255, 0.9)");
      bodyGrad.addColorStop(0.7, "rgba(0, 150, 200, 0.85)");
      bodyGrad.addColorStop(1, "rgba(0, 80, 140, 0.8)");
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      // Specular highlight
      ctx.beginPath();
      ctx.ellipse(cx - 8, cy - 10, 8, 5, -0.3, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.25)";
      ctx.fill();

      // Inner energy ring
      ctx.strokeStyle = `rgba(255,255,255,${0.15 + Math.sin(t * 2) * 0.08})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.25, t * 0.5, t * 0.5 + Math.PI * 1.5);
      ctx.stroke();

      // Particles orbiting
      for (let i = 0; i < 3; i++) {
        const angle = t * (0.5 + i * 0.3) + i * 2.1;
        const dist = radius * 1.6 + Math.sin(t + i) * 3;
        const px = cx + Math.cos(angle) * dist;
        const py = cy + Math.sin(angle) * dist;
        ctx.beginPath();
        ctx.arc(px, py, 1.5 + Math.sin(t * 2 + i) * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(150, 230, 255, ${0.4 + Math.sin(t * 3 + i) * 0.2})`;
        ctx.fill();
      }
    };

    const start = () => {
      if (!rafRef.current && isVisible && isIntersecting) {
        rafRef.current = requestAnimationFrame(draw);
      }
    };

    const handleVisibilityChange = () => {
      isVisible = document.visibilityState === "visible";
      if (isVisible) start();
      else stop();
    };

    const observer = new IntersectionObserver(([entry]) => {
      isIntersecting = entry?.isIntersecting ?? true;
      if (isIntersecting) start();
      else stop();
    });

    observer.observe(canvas);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    start();

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      stop();
    };
  }, []);

  return (
    <motion.button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center"
      aria-label="Abrir Realito AI"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20, delay: 1 }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        style={{ filter: "drop-shadow(0 0 20px rgba(59,213,255,0.3))" }}
      />
      <div className="absolute inset-0 rounded-full animate-ping bg-[#3BD5FF]/20 pointer-events-none" />
    </motion.button>
  );
}

export default function RealitoChatLauncher() {
  const [enabled, setEnabled] = useState(false);

  if (!enabled) {
    return <OrbButton onClick={() => setEnabled(true)} />;
  }

  return (
    <Suspense
      fallback={
        <div className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-xl">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
        </div>
      }
    >
      <RealitoChat initialOpen />
    </Suspense>
  );
}
