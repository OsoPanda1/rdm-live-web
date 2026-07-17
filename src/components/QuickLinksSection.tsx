import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import historiaImg from "@/assets/historia-hero.jpg";
import gastronomiaImg from "@/assets/gastronomia-hero.jpg";
import rutasImg from "@/assets/hero-rdm.jpg";
import eventosImg from "@/assets/eventos-hero.jpg";
import ecoturismoImg from "@/assets/ecoturismo-hero.jpg";
import mitosImg from "@/assets/relatos-hero.jpg";
import arteImg from "@/assets/arte-hero.jpg";
import comunidadImg from "@/assets/cultura-hero.jpg";

const quickLinks = [
  { label: "Historia", path: "/historia", icon: "📜", desc: "Cinco siglos de herencia minera", image: historiaImg },
  { label: "Gastronomía", path: "/gastronomia", icon: "🥟", desc: "Del paste al mole hidalguense", image: gastronomiaImg },
  { label: "Rutas", path: "/rutas", icon: "🗺️", desc: "9 recorridos temáticos", image: rutasImg },
  { label: "Eventos", path: "/eventos", icon: "🎪", desc: "Festivales y fiestas locales", image: eventosImg },
  { label: "Ecoturismo", path: "/ecoturismo", icon: "🌲", desc: "Bosques, cascadas y aventura", image: ecoturismoImg },
  { label: "Mitos", path: "/relatos", icon: "👻", desc: "Leyendas y relatos oscuros", image: mitosImg },
  { label: "Arte", path: "/arte", icon: "💎", desc: "Platería y artesanía local", image: arteImg },
  { label: "Comunidad", path: "/comunidad", icon: "🌍", desc: "Muro global de viajeros", image: comunidadImg },
];

const QuickLinksSection = () => (
  <section className="py-24">
    <div className="container mx-auto px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
        <span className="font-mono text-xs uppercase tracking-widest text-primary mb-3 block">Navega el Pueblo Mágico</span>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase">
          Explora <span className="text-gradient-cyan">Todo</span>
        </h2>
        <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
          Fotografías reales de Real del Monte para descubrir rutas, sabores y experiencias del pueblo.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickLinks.map((link, i) => (
          <Link key={link.path} to={link.path}>
            <motion.article
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              className="glass-surface overflow-hidden group cursor-pointer hover:glow-cyan transition-all duration-500 h-full"
            >
              <div className="relative h-32 overflow-hidden">
                <img
                  src={link.image}
                  alt={`Fotografía de ${link.label} en Real del Monte`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
                <span className="absolute top-3 left-3 text-2xl">{link.icon}</span>
              </div>
              <div className="p-4 text-center">
                <h3 className="text-sm font-semibold tracking-tight mb-1">{link.label}</h3>
                <p className="text-[11px] text-muted-foreground">{link.desc}</p>
              </div>
            </motion.article>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

export default QuickLinksSection;
