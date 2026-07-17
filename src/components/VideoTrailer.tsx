import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const VideoTrailer = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} id="trailer" className="relative py-24 md:py-32 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-night-900 to-background" />
      <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />
      
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-background to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute inset-0 opacity-10 bg-gradient-to-r from-transparent via-gold/10 to-transparent animate-fog-drift" />
      </div>

      <div className="relative container mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1 }}
          className="text-center mb-16"
        >
          <span className="font-body text-[10px] tracking-[0.4em] uppercase text-gold/60">
            Experiencia Cinematográfica
          </span>
          <h2 className="font-display text-4xl md:text-6xl mt-4 tracking-tight">
            <span className="text-gradient-gold">Leyendas de la Mina</span>
          </h2>
          <p className="font-display text-lg text-platinum/50 italic mt-4 max-w-lg mx-auto">
            Próximamente — cortometraje documental
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1, delay: 0.3 }}
          className="relative max-w-5xl mx-auto"
        >
          <div className="relative aspect-video overflow-hidden rounded-xl glass-card">
            <div className="absolute inset-0 bg-gradient-to-b from-night-800 via-night-900/80 to-night-900 flex items-center justify-center">
              <div className="text-center z-10">
                <div className="text-6xl mb-4 opacity-40">🎬</div>
                <p className="font-display text-xl md:text-2xl text-gold/50 italic">
                  Video próximamente
                </p>
                <p className="font-body text-sm text-platinum/30 mt-2">
                  Estamos produciendo el contenido audiovisual
                </p>
              </div>
            </div>
          </div>

          <p className="text-center font-body text-[10px] tracking-[0.2em] uppercase text-muted-foreground mt-6">
            🎧 Recomendado con audífonos · Audio original de la sierra
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default VideoTrailer;
