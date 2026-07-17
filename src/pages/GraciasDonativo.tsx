import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Heart, Sparkles } from "lucide-react";
import { useEffect, useRef } from "react";

function StarField() {
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

    const stars = Array.from({ length: 100 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      s: Math.random() * 1.5 + 0.3,
      o: Math.random() * 0.5 + 0.2,
      speed: Math.random() * 0.02 + 0.005,
      phase: Math.random() * Math.PI * 2,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const now = Date.now() / 1000;
      for (const star of stars) {
        const twinkle = 0.5 + 0.5 * Math.sin(now * star.speed + star.phase);
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.s * twinkle, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${star.o * twinkle})`;
        ctx.fill();
      }
    };

    const interval = setInterval(draw, 30);
    return () => clearInterval(interval);
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />;
}

export default function GraciasDonativo() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#0a0e1a] via-[#0d1225] to-[#1a0f0a]">
      <StarField />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 mx-6 flex max-w-lg flex-col items-center rounded-2xl border border-[#3BD5FF]/20 bg-[#3BD5FF]/5 p-10 text-center backdrop-blur-sm"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#3BD5FF]/20 to-transparent"
        >
          <Heart className="h-8 w-8 text-[#3BD5FF]" />
        </motion.div>
        <Sparkles className="mb-4 h-6 w-6 text-[#3BD5FF]/60" />
        <h1 className="mb-3 text-3xl font-bold text-white/90" style={{ fontFamily: "var(--font-display)" }}>
          ¡Gracias por tu donativo!
        </h1>
        <p className="mb-8 text-sm leading-relaxed text-white/50">
          Tu apoyo ayuda a que Real del Monte siga brillando en su gemelo digital vivo.
          Cada contribución nos acerca más a un territorio más conectado, inteligente y lleno de memoria.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-[#3BD5FF] to-[#0088FF] px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-[#3BD5FF]/20 transition-all hover:scale-105 hover:shadow-xl hover:shadow-[#3BD5FF]/30"
        >
          Volver al inicio
        </Link>
      </motion.div>
    </div>
  );
}
