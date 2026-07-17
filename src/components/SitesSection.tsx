import { motion } from "framer-motion";
import pasteImg from "@/assets/imported/paste.webp";
import museoImg from "@/assets/imported/mina-acosta.webp";
import callesImg from "@/assets/imported/calles-colonial.webp";

const sites = [
  {
    title: "Museo de Mina La Acosta",
    category: "Museo · Histórico",
    description: "Desciende 400m bajo tierra en una de las minas más emblemáticas del siglo XIX.",
    image: museoImg,
    glow: "glow-gold",
  },
  {
    title: "Pastes del Portal",
    category: "Gastronomía · Herencia Cornish",
    description: "La receta original traída por mineros ingleses en 1824, horneada con fuego de leña.",
    image: pasteImg,
    glow: "glow-cyan",
  },
  {
    title: "Centro Histórico",
    category: "Arquitectura · Colonial",
    description: "Calles empedradas con fachadas del siglo XVIII, cada esquina cuenta una historia.",
    image: callesImg,
    glow: "glow-cyan",
  },
];

const SitesSection = () => {
  return (
    <section id="explorar" className="relative py-24 overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <span className="font-mono text-xs uppercase tracking-widest text-primary mb-3 block">
            Descubrimiento
          </span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter uppercase">
            Sitios <span className="text-gradient-gold">Emblemáticos</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {sites.map((site, i) => (
            <motion.div
              key={site.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
              whileHover={{ y: -5 }}
              className={`glass-surface overflow-hidden group cursor-pointer ${site.glow}`}
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={site.image}
                  alt={site.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
              </div>
              <div className="p-6">
                <span className="font-mono text-[10px] uppercase tracking-widest text-primary">
                  {site.category}
                </span>
                <h3 className="text-xl font-medium tracking-tight mt-2 mb-3">{site.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{site.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SitesSection;
