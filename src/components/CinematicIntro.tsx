import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";
import tumirada from "@/assets/musica/tumirada.mp3";

type CinematicIntroProps = {
  onEnter?: () => void;
  autoPlayAudio?: boolean;
};

export const CinematicIntro: React.FC<CinematicIntroProps> = ({
  onEnter,
  autoPlayAudio = true,
}) => {
  const [exiting, setExiting] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [audioBlocked, setAudioBlocked] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const exitingRef = useRef(false);
  const userInteractedRef = useRef(false);

  const startAudio = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || userInteractedRef.current) return;
    userInteractedRef.current = true;

    audio.volume = 0.01;
    audio.play().then(() => {
      setAudioBlocked(false);
      const fadeIn = () => {
        const target = isAudioEnabled ? 0.7 : 0;
        if (audio.volume < target) {
          audio.volume = Math.min(audio.volume + 0.05, target);
          requestAnimationFrame(fadeIn);
        }
      };
      requestAnimationFrame(fadeIn);
    }).catch((err: DOMException) => {
      console.warn("[CinematicIntro] Autoplay bloqueado:", err.message);
      setAudioBlocked(true);
    });
  }, [isAudioEnabled]);

  useEffect(() => {
    const audio = new Audio(tumirada);
    audioRef.current = audio;
    audio.loop = false;
    audio.volume = 0.01;
    audio.preload = "auto";

    const onInteraction = () => {
      if (!userInteractedRef.current) startAudio();
    };
    document.addEventListener("click", onInteraction, { once: true });
    document.addEventListener("touchstart", onInteraction, { once: true });
    document.addEventListener("keydown", onInteraction, { once: true });

    audio.addEventListener("canplaythrough", () => {
      if (autoPlayAudio) startAudio();
    }, { once: true });

    if (audio.readyState >= 3 && autoPlayAudio) {
      startAudio();
    }

    return () => {
      audio.pause();
      audioRef.current = null;
      document.removeEventListener("click", onInteraction);
      document.removeEventListener("touchstart", onInteraction);
      document.removeEventListener("keydown", onInteraction);
    };
  }, [autoPlayAudio, startAudio]);

  const handleEnter = () => {
    if (exitingRef.current) return;
    exitingRef.current = true;
    setExiting(true);

    if (audioRef.current) {
      const audio = audioRef.current;
      const fadeOut = () => {
        if (audio.volume > 0.01) {
          audio.volume = Math.max(audio.volume - 0.05, 0);
          requestAnimationFrame(fadeOut);
        } else {
          audio.pause();
        }
      };
      requestAnimationFrame(fadeOut);
    }

    setTimeout(() => {
      if (onEnter) onEnter();
    }, 800);
  };

  const toggleAudio = () => {
    setIsAudioEnabled((prev) => {
      const next = !prev;
      if (audioRef.current) {
        audioRef.current.muted = !next;
        if (next && !userInteractedRef.current) startAudio();
      }
      return next;
    });
  };

  return (
    <motion.div
      key="cinematic-intro"
      className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        <div className="pointer-events-none absolute inset-0 opacity-20 mix-blend-soft-light" />
      </div>

      <motion.div
        className="absolute inset-x-0 top-16 flex justify-center"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 1.2, ease: "easeOut" }}
      >
        <div className="relative h-64 w-[48rem] max-w-full">
          <motion.svg
            viewBox="0 0 800 300"
            className="h-full w-full text-cyan-400/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 1.4 }}
          >
            <motion.polyline
              points="80,180 200,120 340,160 460,90 600,140 720,110"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.8, ease: "easeInOut", delay: 0.9 }}
            />
          </motion.svg>

          {[
            { x: "80", y: "180", label: "Plaza" },
            { x: "200", y: "120", label: "Mina" },
            { x: "340", y: "160", label: "Panteón inglés" },
            { x: "460", y: "90", label: "Ruta del paste" },
            { x: "600", y: "140", label: "Mirador" },
          ].map((node, idx) => (
            <motion.div
              key={node.label}
              className="absolute"
              style={{
                left: `calc(${parseFloat(node.x) / 8}% - 6px)`,
                top: `calc(${parseFloat(node.y) / 3}% - 6px)`,
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: 0.9 + idx * 0.15,
                type: "spring",
                stiffness: 260,
                damping: 24,
              }}
            >
              <div className="relative">
                <div className="h-3 w-3 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.9)]" />
                <div className="absolute -left-4 top-4 whitespace-nowrap text-xs text-slate-300">
                  {node.label}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        className="relative z-10 flex flex-col items-center px-6 text-center"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.9, ease: "easeOut" }}
      >
        <h1 className="text-3xl md:text-4xl font-semibold tracking-wide text-slate-50">
          Real del Monte Digital Hub
        </h1>
        <p className="mt-3 max-w-xl text-sm md:text-base text-slate-300">
          El pulso vivo de un pueblo mágico en tiempo real. Historias,
          personas, comercios y datos latiendo en un mismo territorio.
        </p>
      </motion.div>

      <motion.div
        className="relative z-10 mt-10 flex flex-col items-center gap-4"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 0.7, ease: "easeOut" }}
      >
        <motion.button
          type="button"
          className="inline-flex items-center justify-center rounded-full border border-rose-400/80 bg-slate-900/60 px-6 py-2 text-sm md:text-base font-medium text-slate-50 shadow-[0_0_25px_rgba(248,113,113,0.35)] backdrop-blur-lg transition-colors hover:bg-slate-900/80"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleEnter}
        >
          Entrar al territorio
        </motion.button>
        <p className="max-w-md text-xs md:text-sm text-slate-400">
          Descubre cómo late Real del Monte ahora mismo. Puedes silenciar la
          banda sonora cuando lo necesites.
        </p>

        <button
          type="button"
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200"
          onClick={toggleAudio}
        >
          <span className="inline-block h-4 w-4 rounded-full border border-slate-500 flex items-center justify-center">
            <span
              className={`h-2 w-2 rounded-full ${
                audioBlocked ? "bg-amber-400 animate-pulse" : isAudioEnabled ? "bg-emerald-400" : "bg-slate-600"
              }`}
            />
          </span>
          <span>
            {audioBlocked
              ? "Toca la pantalla para activar sonido"
              : isAudioEnabled
              ? "Sonido activado"
              : "Sonido desactivado"}
          </span>
        </button>
      </motion.div>

      <motion.div
        className="absolute inset-x-0 bottom-10 flex justify-center"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.8, ease: "easeOut" }}
      >
        <motion.svg
          viewBox="0 0 800 120"
          className="h-16 w-[48rem] max-w-full text-rose-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          <motion.path
            d="M0 60 L80 60 L100 40 L120 80 L140 60 L180 60 L210 25 L240 95 L270 60 L310 60 L340 35 L370 85 L400 60 L430 60 L450 30 L470 90 L490 60 L520 60 L540 40 L560 80 L580 60 L620 60 L640 25 L660 95 L680 60 L720 60 L740 40 L760 80 L800 60"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2.2, ease: "easeInOut", delay: 1.2 }}
          />
        </motion.svg>
      </motion.div>
    </motion.div>
  );
};
