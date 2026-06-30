import { useEffect } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import cinematicBackdrop from "@/assets/rdm-header-bandcamp.jpg";
import cinematicOverlay from "@/assets/rdm-hero-cinematic.png";

interface ModuleCinematicIntroProps {
  eyebrow: string;
  title: string;
  description: string;
  onComplete: () => void;
  durationMs?: number;
}

export function ModuleCinematicIntro({
  eyebrow,
  title,
  description,
  onComplete,
  durationMs = 5200,
}: ModuleCinematicIntroProps) {
  useEffect(() => {
    const timer = window.setTimeout(onComplete, durationMs);
    return () => window.clearTimeout(timer);
  }, [durationMs, onComplete]);

  return (
    <motion.div
      key="module-cinematic-intro"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 z-[120] overflow-hidden"
    >
      <img
        src={cinematicBackdrop}
        alt="Fondo cinematográfico de Real del Monte"
        className="absolute inset-0 h-full w-full object-cover"
        loading="eager"
        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
      />
      <img
        src={cinematicOverlay}
        alt="Capa visual inmersiva"
        className="absolute inset-0 h-full w-full object-cover opacity-55 mix-blend-screen"
        loading="eager"
        onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, hsl(var(--primary) / 0.35) 0%, hsl(var(--background) / 0.92) 60%, hsl(var(--background)) 100%)",
        }}
      />

      <div className="absolute inset-0 gradient-top" />
      <div className="absolute inset-0 gradient-bottom" />

      <div className="relative z-10 flex h-full items-center justify-center px-6 text-center">
        <div className="max-w-4xl">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mb-4 text-xs font-body uppercase tracking-[0.42em] text-accent"
          >
            {eyebrow}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 28, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="text-4xl font-display font-bold leading-[0.9] md:text-6xl lg:text-7xl"
          >
            <span className="shimmer-text">{title}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mx-auto mt-5 max-w-2xl text-sm font-body text-foreground/75 md:text-base"
          >
            {description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.7 }}
            className="mt-8 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background/35 px-4 py-2 text-xs text-muted-foreground"
          >
            <Sparkles className="h-3 w-3 text-accent" />
            MODO CINEMÁTICO ACTIVO
          </motion.div>
        </div>
      </div>

      <button
        type="button"
        onClick={onComplete}
        className="absolute right-4 top-4 z-20 rounded-full border border-border/60 bg-background/45 px-4 py-2 text-xs font-body text-foreground/75 transition-colors hover:text-accent"
      >
        Omitir
      </button>

      <div className="absolute inset-x-0 top-0 h-12 bg-background" />
      <div className="absolute inset-x-0 bottom-0 h-12 bg-background" />
    </motion.div>
  );
}
