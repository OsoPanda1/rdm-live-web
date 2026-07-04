import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";
import { ChevronDown, Mountain, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { RDM_IMAGES } from "@/data/rdm-images";

/**
 * RDMHero — cinematic video background with gradient fallback.
 * To activate the video, place your file at /public/video/hero.mp4
 * (and optionally /public/video/hero.webm for better browser support).
 * The poster image at /public/images/rdm-hero.png is used while the video loads.
 */
export function RDMHero() {
  const ref = useRef<HTMLDivElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative h-[100vh] overflow-hidden">
      <motion.div style={{ y }} className="absolute inset-0">
        {/* ── Gradient fallback (always visible under the video) ── */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, hsl(220 25% 12%) 0%, hsl(215 30% 18%) 30%, hsl(24 40% 25%) 70%, hsl(218 24% 10%) 100%)",
          }}
        />

        {/* ── Production-safe visual: bundled asset, no missing /video dependency ── */}
        <motion.img
          src={RDM_IMAGES.aerialPueblo}
          alt="Vista panorámica de Real del Monte"
          onLoad={() => setImageLoaded(true)}
          className="absolute inset-0 h-full w-full object-cover"
          style={{ opacity: imageLoaded ? 1 : 0.35 }}
          animate={{ opacity: imageLoaded ? 1 : 0.35, scale: imageLoaded ? 1 : 1.02 }}
          transition={{ duration: 1.4 }}
        />

        {/* ── Cinematic grading overlay ── */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, hsl(220 30% 6% / 0.55) 0%, hsl(220 25% 8% / 0.3) 50%, hsl(48 38% 96% / 1) 100%)",
          }}
        />
      </motion.div>

      <motion.div style={{ opacity }} className="relative z-10 h-full flex flex-col justify-end pb-24 px-6 md:px-16 lg:px-24">
        <div className="max-w-4xl">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.8 }} className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-[hsl(var(--rdm-amber)/0.2)] backdrop-blur-sm flex items-center justify-center border border-[hsl(var(--rdm-amber)/0.3)]">
              <Mountain className="w-5 h-5 text-[hsl(var(--rdm-amber))]" />
            </div>
            <span className="text-sm tracking-[0.3em] uppercase text-[hsl(var(--rdm-amber))] font-medium" style={{ fontFamily: "var(--font-body)" }}>
              Pueblo Mágico · Hidalgo, México
            </span>
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 1 }} className="text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.9] mb-6 text-white" style={{ fontFamily: "var(--font-display)" }}>
            Descubre la<br /><span className="text-[hsl(var(--rdm-amber))]">magia</span> que<br />vive en la sierra
          </motion.h1>

          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.8 }} className="text-lg md:text-xl text-white/70 max-w-xl leading-relaxed mb-8" style={{ fontFamily: "var(--font-body)" }}>
            A 2,700 metros sobre el nivel del mar, donde la historia minera británica se fusiona con la calidez mexicana.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1, duration: 0.8 }} className="flex flex-wrap gap-4">
            <Link to="/mapa" className="inline-flex items-center gap-3 bg-[hsl(var(--rdm-amber))] text-white px-8 py-4 rounded-full font-semibold text-sm tracking-wide hover:opacity-90 transition-all hover:scale-105" style={{ fontFamily: "var(--font-body)" }}>
              Explorar Mapa <ChevronDown className="w-4 h-4" />
            </Link>
            <Link to="/historia" className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm px-8 py-4 rounded-full font-medium text-sm tracking-wide text-white/80 hover:text-white border border-white/20 transition-colors" style={{ fontFamily: "var(--font-body)" }}>
              <MapPin className="w-4 h-4" /> Nuestra Historia
            </Link>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.4, duration: 0.8 }} className="absolute bottom-8 right-6 md:right-16 lg:right-24 flex gap-8">
          {[{ value: "500+", label: "Años de historia" }, { value: "2,700m", label: "Altitud" }, { value: "14°C", label: "Temperatura media" }].map((stat) => (
            <div key={stat.label} className="text-right">
              <p className="text-2xl md:text-3xl font-bold text-[hsl(var(--rdm-amber))]" style={{ fontFamily: "var(--font-display)" }}>{stat.value}</p>
              <p className="text-xs text-white/50" style={{ fontFamily: "var(--font-body)" }}>{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>

      <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
        <ChevronDown className="w-6 h-6 text-[hsl(var(--rdm-amber)/0.5)]" />
      </motion.div>
    </section>
  );
}
