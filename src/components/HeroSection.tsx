import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Compass, ChevronDown, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import heroImg from "@/assets/imported/hero-real-del-monte.webp";
import rdmLogo from "@/assets/rdm-digital-nexus-logo.png";
import { AuroraBackground, FloatingOrbs } from "@/components/VisualEffects";

const HeroSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  return (
    <section ref={ref} id="hero" className="relative min-h-screen overflow-hidden">
      <motion.div className="absolute inset-0" style={{ y, scale }}>
        <img src={heroImg} alt="Real del Monte al atardecer" width="1920" height="1080" fetchPriority="high" loading="eager" className="w-full h-full object-cover ken-burns" style={{ opacity: 0.4 }} />
      </motion.div>

      <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/40 to-background" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsla(43,80%,55%,0.06),transparent_50%)]" />
      <AuroraBackground />
      <FloatingOrbs />
      <div className="dust-particles" />
      <div className="absolute inset-0 grid-pattern opacity-30 pointer-events-none" />

      <motion.div className="relative flex flex-col items-center justify-center min-h-screen px-6 pb-20 pt-24" style={{ opacity }}>
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2, delay: 0.3 }}
          className="mb-8">
          <div className="relative w-32 h-32 md:w-44 md:h-44 rounded-full overflow-hidden animate-float pulse-gold ring-2 ring-amber-300/40"
            style={{ filter: "drop-shadow(0 0 40px hsla(43,80%,55%,0.35))" }}>
            <img src={rdmLogo} alt="Logo oficial RDM Digital Nexus" className="w-full h-full object-cover" />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.5 }}
          className="glass rounded-full px-5 py-2 mb-6 flex items-center gap-2">
          <span className="font-body text-[11px] tracking-[0.25em] uppercase text-[hsl(var(--platinum))]">Real del Monte</span>
          <span className="mx-1 h-3 w-px bg-foreground/20" />
          <span className="text-[hsl(var(--gold))] text-[11px] tracking-[0.25em] uppercase font-body">Pueblo Mágico</span>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, delay: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="font-display text-5xl md:text-7xl lg:text-9xl text-center tracking-tight leading-none">
          <span className="block text-foreground">Explora la magia de</span>
          <span className="block text-gradient-gold animate-gradient-text text-glow-gold">
            Real del Monte
          </span>
        </motion.h1>

        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 1.3 }}
          className="font-display text-base md:text-xl text-muted-foreground italic text-center max-w-2xl mt-6 leading-relaxed">
          Historia minera, gastronomía local, eventos vivos y rutas culturales en una sola plataforma digital a 2,660 metros de altura.
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 1.5 }}
          className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground mt-6">
          {[{ label: "Altitud", value: "2,660 msnm" }, { label: "Fundado", value: "1739" }, { label: "Patrimonio", value: "UNESCO" }].map((stat) => (
            <div key={stat.label} className="flex items-center gap-2">
              <Sparkles className="h-3 w-3 text-[hsl(var(--gold))]/60" />
              <span className="text-foreground font-medium">{stat.value}</span>
              <span className="text-muted-foreground">{stat.label}</span>
            </div>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 1.8 }}
          className="mt-10 flex flex-col sm:flex-row gap-4">
          <Link to="/#mapa" className="btn-hero-primary group inline-flex items-center gap-2">
            <Compass className="h-4 w-4 transition-transform group-hover:rotate-45" /> Explorar Mapa Vivo
          </Link>
          <Link to="/rutas" className="btn-hero-glass inline-flex items-center gap-2">Ver Rutas Turísticas</Link>
        </motion.div>
      </motion.div>

      <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        animate={{ y: [0, 8, 0] }} transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}>
        <span className="font-body text-[9px] tracking-[0.3em] uppercase text-muted-foreground">Descubre</span>
        <ChevronDown className="w-4 h-4 text-[hsl(var(--gold))]/50" />
      </motion.div>
    </section>
  );
};

export default HeroSection;
