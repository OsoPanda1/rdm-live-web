import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { MapPin, Heart, Mail, Phone, Sparkles } from "lucide-react";
import fogImg from "@/assets/landscape-fog.jpg";
import logoImg from "@/assets/rdm-logo.png";

const footerLinks = [
  { label: "Historia", path: "/historia" },
  { label: "Gastronomía", path: "/gastronomia" },
  { label: "Cultura", path: "/cultura" },
  { label: "Rutas", path: "/rutas" },
  { label: "Comercios", path: "/comercios" },
  { label: "Eventos", path: "/eventos" },
  { label: "Mapa Vivo", path: "/mapa" },
  { label: "Apoya", path: "/apoya" },
  { label: "Registrar Negocio", path: "/registro-comercio" },
];

const BrumaFooter = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <footer ref={ref} className="relative" style={{ background: "linear-gradient(180deg, hsl(220,45%,6%) 0%, hsl(220,50%,3%) 100%)" }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-64 h-64 rounded-full bg-[hsla(210,100%,55%,0.03)] blur-3xl animate-orb" />
        <div className="absolute bottom-20 right-1/4 w-48 h-48 rounded-full bg-[hsla(43,80%,55%,0.03)] blur-3xl animate-orb-reverse" />
      </div>

      <div className="separator-animated w-full" />

      <div className="relative container mx-auto px-6 md:px-12 py-16">
        <div className="grid md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 1 }}>
              <div className="flex items-center gap-3 mb-4">
                <img src={logoImg} alt="RDM Digital" loading="lazy" className="w-14 h-14 object-contain" style={{ filter: "drop-shadow(0 0 10px hsla(210,100%,55%,0.3))" }} />
                <div>
                  <span className="font-display text-xl font-bold text-foreground">RDM Digital</span>
                  <div className="flex items-center gap-1 text-[10px] tracking-wider text-gold/60">
                    <Sparkles className="w-3 h-3" /> Innovación Turística 2026
                  </div>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground mb-6">
                Tu guía comunitaria digital para descubrir Real del Monte, Pueblo Mágico de Hidalgo. Servicios de altura para visitantes exigentes.
              </p>
              <h3 className="font-display text-3xl md:text-4xl tracking-tight mb-4">
                <span className="text-gradient-gold">La niebla siempre vuelve</span>
              </h3>
              <p className="font-display text-base text-platinum/50 italic max-w-lg">
                Y con ella, la invitación a perderse entre calles empedradas, ecos mineros y el aroma de un paste recién horneado.
              </p>
            </motion.div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Explorar</h4>
            <ul className="space-y-2.5">
              {footerLinks.slice(0, 5).map((item) => (
                <li key={item.label}>
                  <Link to={item.path} className="text-sm text-muted-foreground hover:text-gold transition-colors duration-300">{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact + more links */}
          <div>
            <h4 className="font-display font-semibold text-foreground mb-4">Descubre</h4>
            <ul className="space-y-2.5 mb-6">
              {footerLinks.slice(5).map((item) => (
                <li key={item.label}>
                  <Link to={item.path} className="text-sm text-muted-foreground hover:text-electric transition-colors duration-300">{item.label}</Link>
                </li>
              ))}
            </ul>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 shrink-0 text-electric" /> <span>Real del Monte, Hidalgo</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4 shrink-0 text-gold" /> <span>info@rdmdigital.mx</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8" style={{ borderTop: "1px solid hsla(210,100%,55%,0.08)" }}>
          <div className="flex flex-col md:flex-row items-center justify-between text-center md:text-left gap-4">
            <div className="flex items-center gap-2">
              <MapPin className="w-3 h-3 text-gold/40" />
              <p className="font-body text-[10px] text-muted-foreground tracking-wider">© 2026 RDM Digital · Innovación Turística Inteligente</p>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/apoya" className="inline-flex items-center gap-2 text-xs text-gold hover:text-gold-light transition-colors">
                <Heart className="w-3 h-3" /> Apoya RDM Digital
              </Link>
              <p className="font-body text-[10px] text-muted-foreground tracking-wider">Powered by Realito AI</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default BrumaFooter;
