import { motion } from "framer-motion";
import { useLocation, Link } from "react-router-dom";
import { useEffect, useRef } from "react";
import { logger } from "@/lib/logger";
import { Compass, Home } from "lucide-react";
import { RDMLayout } from "@/components/rdm/RDMLayout";

function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);

    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      s: Math.random() * 2 + 0.5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      o: Math.random() * 0.3 + 0.1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59, 213, 255, ${p.o})`;
        ctx.fill();
      }
    };

    const interval = setInterval(draw, 50);
    return () => clearInterval(interval);
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />;
}

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    logger.error("404 Error:", { path: location.pathname });
  }, [location.pathname]);

  return (
    <RDMLayout>
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0a0e1a]">
      <ParticleField />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 flex flex-col items-center px-6 text-center"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-[#3BD5FF]/20"
        >
          <Compass className="h-10 w-10 text-[#3BD5FF]/60" />
        </motion.div>
        <h1 className="mb-2 text-8xl font-bold text-white/10" style={{ fontFamily: "var(--font-display)" }}>
          404
        </h1>
        <p className="mb-1 text-lg text-white/60 font-light tracking-wide">
          Esta ruta no existe en el territorio digital
        </p>
        <p className="mb-8 text-sm text-white/30">
          "{location.pathname}" no es un sendero conocido
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full border border-[#3BD5FF]/30 bg-[#3BD5FF]/5 px-6 py-3 text-sm text-[#3BD5FF] transition-all hover:bg-[#3BD5FF]/10 hover:shadow-lg hover:shadow-[#3BD5FF]/10"
        >
          <Home className="h-4 w-4" />
          Volver al inicio
        </Link>
      </motion.div>
    </div>
    </RDMLayout>
  );
};

export default NotFound;
