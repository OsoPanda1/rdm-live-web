/**
 * TAMVTrixField – Campo cuántico vivo de TAMV ONLINE
 * Fondo inmersivo 3D: solo alfabeto TAMVONLINE, profundidad, respiración y hero central.
 */

import React, { useEffect, useRef, useState } from "react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";

interface TAMVTrixFieldProps {
  title?: string;
  subtitle?: string;
  showHero?: boolean;
}

type Column = {
  y: number;
  depth: number;
  scale: number;
  drift: number;
  opacity: number;
  wordIndex: number;
  charIndex: number;
};

const CORE_LETTERS = "TAMVONLINE".split("");
const WORDS = ["TAMV", "ONLINE", "TAMVONLINE", "GENESIS", "DIGYTAMV", "NETWORK"];

const TAMVTrixField: React.FC<TAMVTrixFieldProps> = ({
  title = "TAMV ONLINE",
  subtitle = "SOCIEDAD CUÁNTICA AUTÓNOMA",
  showHero = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Parallax global suave
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const mxSpring = useSpring(mx, { stiffness: 70, damping: 18, mass: 0.7 });
  const mySpring = useSpring(my, { stiffness: 70, damping: 18, mass: 0.7 });
  const rotateY = useTransform(mxSpring, [0, 1], [-10, 10]);
  const rotateX = useTransform(mySpring, [0, 1], [6, -6]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let columns: Column[] = [];
    let columnWidth = 0;
    const minFontSize = 11;
    const maxFontSize = 40;

    const initColumns = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      const baseFont = (minFontSize + maxFontSize) / 2;
      columnWidth = baseFont * 0.8;
      const columnCount = Math.floor(canvas.width / columnWidth);

      columns = Array.from({ length: columnCount }).map((_, i): Column => {
        const depth = Math.random(); // 0 cerca, 1 lejos
        const scale = 0.7 + Math.random() * 1.1;
        const drift = (Math.random() - 0.5) * 1.4;
        const opacity = 0.25 + 0.75 * (1 - depth);

        return {
          y: Math.floor(Math.random() * canvas.height),
          depth,
          scale,
          drift,
          opacity,
          wordIndex: Math.floor(Math.random() * WORDS.length),
          charIndex: Math.floor(Math.random() * CORE_LETTERS.length),
        };
      });
    };

    const draw = () => {
      const { width, height } = canvas;

      // Estela sutil
      ctx.fillStyle = "rgba(2, 6, 23, 0.12)";
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;

      columns.forEach((col, i) => {
        const depth = col.depth;
        const z = 1 - depth;

        const fontSize =
          minFontSize +
          (maxFontSize - minFontSize) * col.scale * (0.4 + 0.6 * z);

        const baseX = i * columnWidth + columnWidth / 2;
        const x = baseX + col.drift * 28 * z;
        const y = col.y;

        // centro más denso / rápido, bordes más ligeros
        const distToCenter = Math.abs(x - centerX) / centerX;
        const densityBoost = 0.4 + (1 - Math.min(distToCenter, 1)) * 0.8;
        const velocityBase = 0.9 * (0.3 + 0.9 * z);
        const velocity = velocityBase * densityBoost;

        const word = WORDS[col.wordIndex] || "TAMVONLINE";
        const coreLetter =
          CORE_LETTERS[Math.floor(Math.random() * CORE_LETTERS.length)];
        const wordLetter = word[col.charIndex % word.length];

        // lejos = core, cerca = palabra legible TAMV
        const letter = depth > 0.55 ? coreLetter : wordLetter;

        const gradient = ctx.createLinearGradient(
          x,
          y - fontSize * 5,
          x,
          y + fontSize
        );

        const headColor = "#3bf5ff";
        const haloColor = `rgba(59, 245, 255, ${
          0.35 * col.opacity + 0.22 * z
        })`;
        const tailColor = `rgba(0, 160, 255, ${
          0.12 * col.opacity + 0.12 * z
        })`;

        gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
        gradient.addColorStop(0.35, tailColor);
        gradient.addColorStop(0.8, haloColor);
        gradient.addColorStop(1, headColor);

        ctx.fillStyle = gradient;
        ctx.font = `${fontSize}px "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Courier New", monospace`;
        ctx.textAlign = "center";

        ctx.shadowColor = `rgba(59, 245, 255, ${0.25 + 0.4 * z})`;
        ctx.shadowBlur = 4 + 22 * z;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;

        ctx.globalAlpha = col.opacity;
        ctx.fillText(letter, x, y);
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;

        col.y += velocity * (fontSize / 9);

        if (col.y > height + fontSize * 2) {
          col.y = -fontSize * (2 + Math.random() * 6);
          col.depth = Math.random();
          const z2 = 1 - col.depth;
          col.scale = 0.7 + Math.random() * 1.1;
          col.drift = (Math.random() - 0.5) * 1.4;
          col.opacity = 0.25 + 0.75 * z2;
          col.wordIndex = Math.floor(Math.random() * WORDS.length);
          col.charIndex = Math.floor(Math.random() * CORE_LETTERS.length);
        } else if (Math.random() < 0.5) {
          col.charIndex = (col.charIndex + 1) % word.length;
        }
      });

      animationId = requestAnimationFrame(draw);
    };

    initColumns();
    window.addEventListener("resize", initColumns);
    animationId = requestAnimationFrame(draw);
    setTimeout(() => setIsLoaded(true), 600);

    return () => {
      window.removeEventListener("resize", initColumns);
      cancelAnimationFrame(animationId);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;
    mx.set(nx);
    my.set(ny);
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden"
      onMouseMove={handleMouseMove}
      style={{ perspective: "1600px" }}
    >
      {/* Fondo profundo TAMV */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#02030a] via-[#020617] to-black" />

      {/* Campo TAMVTRIX */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 opacity-45"
        style={{ mixBlendMode: "screen" }}
      />

      {/* Capas 3D ligadas al cursor */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          transformStyle: "preserve-3d",
          rotateY,
          rotateX,
        }}
      >
        {/* Grid lejano */}
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage: `
              linear-gradient(rgba(56,189,248,0.07) 1px, transparent 1px),
              linear-gradient(90deg, rgba(129,140,248,0.06) 1px, transparent 1px)
            `,
            backgroundSize: "120px 120px",
            transform: "translateZ(-260px) scale(1.5)",
            mixBlendMode: "soft-light",
          }}
        />

        {/* Órbitas suaves */}
        <div
          className="absolute inset-0"
          style={{ transform: "translateZ(-140px) scale(1.2)" }}
        >
          <div
            className="absolute inset-1/4 rounded-full border border-cyan-400/15"
            style={{
              boxShadow:
                "0 0 40px rgba(59,245,255,0.25), 0 0 80px rgba(37,99,235,0.25)",
            }}
          />
          <div className="absolute inset-[30%] rounded-full border border-slate-500/12" />
        </div>

        {/* Partículas TAMV */}
        <div
          className="absolute inset-0"
          style={{ transform: "translateZ(-100px)" }}
        >
          {Array.from({ length: 30 }).map((_, i) => {
            const left = Math.random() * 100;
            const top = Math.random() * 100;
            return (
              <motion.div
                key={i}
                className="absolute w-[3px] h-[3px] rounded-full bg-cyan-300"
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  boxShadow: "0 0 14px rgba(59,245,255,0.9)",
                }}
                animate={{
                  y: [0, -28, 0],
                  opacity: [0.2, 1, 0.2],
                  scale: [1, 1.8, 1],
                }}
                transition={{
                  duration: 3 + Math.random() * 2.5,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: "easeInOut",
                }}
              />
            );
          })}
        </div>
      </motion.div>

      {/* Hero central */}
      {showHero && (
        <AnimatePresence>
          {isLoaded && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.1, ease: "easeOut" }}
              className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10"
            >
              <motion.h1
                className="text-4xl md:text-6xl lg:text-7xl xl:text-8xl font-black tracking-[0.38em] text-center uppercase"
                style={{
                  color: "transparent",
                  background:
                    "linear-gradient(180deg,#ffffff 0%,#e0faff 25%,#3bf5ff 45%,#1d4ed8 75%,#020617 100%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                }}
                animate={{
                  textShadow: [
                    "0 0 12px rgba(59,245,255,0.6),0 0 30px rgba(59,245,255,0.4),0 0 60px rgba(37,99,235,0.4)",
                    "0 0 18px rgba(59,245,255,1),0 0 45px rgba(59,245,255,0.7),0 0 90px rgba(37,99,235,0.55)",
                    "0 0 12px rgba(59,245,255,0.6),0 0 30px rgba(59,245,255,0.4),0 0 60px rgba(37,99,235,0.4)",
                  ],
                  letterSpacing: ["0.36em", "0.40em", "0.36em"],
                }}
                transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
              >
                {title}
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.9, delay: 1 }}
                className="relative mt-4"
              >
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/25 to-transparent blur-xl" />
                <h2
                  className="text-[11px] md:text-base lg:text-lg xl:text-xl font-semibold tracking-[0.5em] text-center uppercase text-cyan-200"
                  style={{
                    textShadow:
                      "0 0 10px rgba(59,245,255,0.8),0 0 22px rgba(37,99,235,0.6)",
                  }}
                >
                  {subtitle}
                </h2>
              </motion.div>

              <motion.div
                className="mt-7 flex items-center gap-4"
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 1.1, delay: 1.6 }}
              >
                <div className="h-px w-32 bg-gradient-to-r from-transparent via-cyan-400/80 to-cyan-300/40" />
                <div className="w-2 h-2 rotate-45 bg-cyan-400 shadow-[0_0_16px_rgba(59,245,255,0.9)] animate-pulse" />
                <div className="h-px w-32 bg-gradient-to-l from-transparent via-cyan-400/80 to-cyan-300/40" />
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.2 }}
                className="mt-5 text-[10px] md:text-xs lg:text-sm tracking-[0.38em] text-slate-300 uppercase"
              >
                CAMPO MATRIZIAL VIVO · IDENTIDAD TOTAL TAMV
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Viñeta + scanlines */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 0%, rgba(2,6,23,0.9) 100%)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-7"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(59,245,255,0.05) 2px, rgba(59,245,255,0.05) 4px)",
        }}
      />
    </div>
  );
};

export default TAMVTrixField;
