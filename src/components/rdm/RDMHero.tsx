import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { ChevronDown, Mountain, MapPin, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { RDM_IMAGES } from "@/data/rdm-images";

const HERO_IMAGES = [
  "/images/hero-realdelmonte.jpg",
  "/images/rdm-aerial-pueblo.jpg",
  "/images/rdm-bosque-niebla.jpg",
  "/images/rdm-calles-coloridas.jpg",
  "/images/rdm-mirador-sunset.jpg",
];

export function RDMHero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const [currentImg, setCurrentImg] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImg((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section ref={ref} className="relative h-[100vh] overflow-hidden rdm-hero-cinematic">
      {/* Background Images with Ken Burns */}
      <motion.div style={{ y, scale }} className="absolute inset-0">
        {HERO_IMAGES.map((img, i) => (
          <div
            key={img}
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-[2000ms]"
            style={{
              backgroundImage: `url(${img})`,
              opacity: i === currentImg ? 0.5 : 0,
              animation: i === currentImg ? "rdmKenBurns 25s ease-in-out infinite alternate" : "none",
            }}
          />
        ))}

        {/* Gradient overlays */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, hsl(220 25% 12% / 0.8) 0%, hsl(215 30% 18% / 0.5) 30%, hsl(24 40% 25% / 0.4) 70%, hsl(218 24% 10% / 0.7) 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, hsl(220 30% 6% / 0.55) 0%, hsl(220 25% 8% / 0.2) 40%, hsl(48 38% 96% / 1) 100%)",
          }}
        />

        {/* Vignette */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 50%, transparent 40%, hsl(222 47% 5% / 0.6) 100%)",
          }}
        />
      </motion.div>

      {/* Floating Particles */}
      <div className="rdm-particles">
        {Array.from({ length: 8 }).map((_, i) => (
          <span key={i} />
        ))}
      </div>

      {/* Image indicators */}
      <div className="absolute top-8 right-8 z-20 flex gap-2">
        {HERO_IMAGES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentImg(i)}
            className={`w-2 h-2 rounded-full transition-all duration-500 ${
              i === currentImg
                ? "bg-[hsl(var(--rdm-amber))] w-6"
                : "bg-white/30 hover:bg-white/50"
            }`}
            aria-label={`Background image ${i + 1}`}
          />
        ))}
      </div>

      {/* Content */}
      <motion.div style={{ opacity }} className="relative z-10 h-full flex flex-col justify-end pb-24 px-6 md:px-16 lg:px-24">
        <div className="max-w-4xl">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="w-10 h-10 rounded-full bg-[hsl(var(--rdm-amber)/0.2)] backdrop-blur-sm flex items-center justify-center border border-[hsl(var(--rdm-amber)/0.3)] rdm-pulse-ring">
              <Mountain className="w-5 h-5 text-[hsl(var(--rdm-amber))]" />
            </div>
            <span
              className="text-sm tracking-[0.3em] uppercase text-[hsl(var(--rdm-amber))] font-medium"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Pueblo Mágico · Hidalgo, México
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.9] mb-6 text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Descubre la
            <br />
            <span className="text-gradient-gold">magia</span> que
            <br />
            vive en la sierra
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="text-lg md:text-xl text-white/70 max-w-xl leading-relaxed mb-8"
            style={{ fontFamily: "var(--font-body)" }}
          >
            A 2,700 metros sobre el nivel del mar, donde la historia minera británica se fusiona con la calidez mexicana.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            className="flex flex-wrap gap-4"
          >
            <Link
              to="/mapa"
              className="inline-flex items-center gap-3 bg-[hsl(var(--rdm-amber))] text-white px-8 py-4 rounded-full font-semibold text-sm tracking-wide rdm-btn-shimmer rdm-magnetic hover:shadow-[0_0_30px_-5px_hsla(43,80%,55%,0.5)] transition-shadow"
              style={{ fontFamily: "var(--font-body)" }}
            >
              <Sparkles className="w-4 h-4" /> Explorar Mapa
            </Link>
            <Link
              to="/historia"
              className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm px-8 py-4 rounded-full font-medium text-sm tracking-wide text-white/80 hover:text-white border border-white/20 hover:border-[hsl(var(--rdm-amber)/0.4)] hover:bg-[hsl(var(--rdm-amber)/0.1)] transition-all rdm-magnetic"
              style={{ fontFamily: "var(--font-body)" }}
            >
              <MapPin className="w-4 h-4" /> Nuestra Historia
            </Link>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.8 }}
          className="absolute bottom-8 right-6 md:right-16 lg:right-24 flex gap-8"
        >
          {[
            { value: "500+", label: "Años de historia" },
            { value: "2,700m", label: "Altitud" },
            { value: "14°C", label: "Temperatura media" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6 + i * 0.15 }}
              className="text-right"
            >
              <p
                className="text-2xl md:text-3xl font-bold text-[hsl(var(--rdm-amber))]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {stat.value}
              </p>
              <p className="text-xs text-white/80" style={{ fontFamily: "var(--font-body)" }}>
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <ChevronDown className="w-6 h-6 text-[hsl(var(--rdm-amber)/0.5)]" />
      </motion.div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent z-[3]" />
    </section>
  );
}
