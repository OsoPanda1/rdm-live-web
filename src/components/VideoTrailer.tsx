import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";

const VideoTrailer = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section ref={ref} id="trailer" className="relative py-24 md:py-32 overflow-hidden">
      {/* Dark gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-night-900 to-background" />
      <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />
      
      {/* Fog decoration */}
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
            Una inmersión audiovisual en el corazón de la montaña
          </p>
        </motion.div>

        {/* Video container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 1, delay: 0.3 }}
          className="relative max-w-5xl mx-auto"
        >
          <div className="relative aspect-video overflow-hidden rounded-xl glass-card">
            {!isPlaying ? (
              <>
                <div className="absolute inset-0 bg-gradient-to-b from-night-800 via-night-900/80 to-night-900 flex items-center justify-center">
                  {/* Decorative ore texture */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsla(43,80%,55%,0.2),transparent_70%)]" />
                  </div>
                  
                  <button
                    onClick={() => setIsPlaying(true)}
                    className="group relative z-10"
                  >
                    <motion.div
                      className="w-20 h-20 md:w-28 md:h-28 rounded-full flex items-center justify-center"
                      style={{
                        background: "radial-gradient(circle, hsla(43, 80%, 55%, 0.15), transparent)",
                        border: "1px solid hsla(43, 80%, 55%, 0.3)",
                      }}
                      animate={{
                        boxShadow: [
                          "0 0 0 0 hsla(43, 80%, 55%, 0.2)",
                          "0 0 0 20px hsla(43, 80%, 55%, 0)",
                          "0 0 0 0 hsla(43, 80%, 55%, 0.2)",
                        ],
                      }}
                      transition={{ duration: 2.5, repeat: Infinity }}
                    >
                      <svg className="w-8 h-8 md:w-10 md:h-10 text-gold group-hover:scale-110 transition-transform ml-1" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </motion.div>
                    <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 font-body text-[10px] tracking-[0.3em] uppercase text-gold/40 whitespace-nowrap">
                      Reproducir tráiler
                    </span>
                  </button>
                </div>
              </>
            ) : (
              <video
                src={leyendaVideo}
                className="w-full h-full object-cover"
                controls
                autoPlay
                playsInline
              />
            )}
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
