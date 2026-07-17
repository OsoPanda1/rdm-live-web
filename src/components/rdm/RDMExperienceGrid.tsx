import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Pickaxe, Utensils, Mountain, Bed, Palette } from "lucide-react";
import { Link } from "react-router-dom";
import pasteriasImg from "@/assets/pasterias.png";
import plateriasImg from "@/assets/platerias.png";
import artesaniasImg from "@/assets/artesanias.png";

const EXPERIENCES = [
  { id: "historia", title: "Historia Minera", subtitle: "500 años de plata", icon: Pickaxe, to: "/historia", span: "col-span-2 row-span-2", gradient: "from-amber-900/80 via-amber-800/40", image: null },
  { id: "gastronomia", title: "Gastronomía", subtitle: "Pastes & tradición", icon: Utensils, to: "/gastronomia", span: "col-span-1 row-span-1", gradient: "from-emerald-900/80 via-emerald-800/40", image: pasteriasImg },
  { id: "aventura", title: "Aventura", subtitle: "Sierra salvaje", icon: Mountain, to: "/ecoturismo", span: "col-span-1 row-span-1", gradient: "from-red-900/80 via-red-800/40", image: null },
  { id: "hospedaje", title: "Platerías", subtitle: "Artesanía en plata", icon: Bed, to: "/directorio", span: "col-span-1 row-span-1", gradient: "from-purple-900/80 via-purple-800/40", image: plateriasImg },
  { id: "cultura", title: "Artesanías", subtitle: "Tradiciones ancestrales", icon: Palette, to: "/cultura", span: "col-span-1 row-span-1", gradient: "from-blue-900/80 via-blue-800/40", image: artesaniasImg },
];

export function RDMExperienceGrid() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 px-6 md:px-16 lg:px-24">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8 }} className="text-center mb-16">
        <p className="text-sm tracking-[0.3em] uppercase text-[hsl(var(--rdm-amber))] mb-4" style={{ fontFamily: "var(--font-body)" }}>Experiencias Inmersivas</p>
        <h2 className="text-4xl md:text-6xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
          Cinco mundos, <span className="text-[hsl(var(--rdm-amber))]">una sierra</span>
        </h2>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 max-w-7xl mx-auto auto-rows-[200px] md:auto-rows-[240px]">
        {EXPERIENCES.map((exp, i) => (
          <motion.div key={exp.id} initial={{ opacity: 0, y: 40 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ delay: i * 0.1, duration: 0.6 }} className={exp.span}>
            <Link to={exp.to} className="block relative rounded-2xl overflow-hidden group cursor-pointer h-full" style={{ background: "linear-gradient(135deg, hsl(218 24% 15%), hsl(215 30% 22%), hsl(24 30% 20%))" }}>
              {exp.image && <img src={exp.image} alt={exp.title} loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity" />}
              <div className={`absolute inset-0 bg-gradient-to-t ${exp.gradient} to-transparent`} />
              <div className="absolute inset-0 bg-[hsl(var(--rdm-amber)/0)] group-hover:bg-[hsl(var(--rdm-amber)/0.1)] transition-colors duration-500" />
              <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <exp.icon className="w-4 h-4 text-[hsl(var(--rdm-amber))]" />
                  </div>
                  <span className="text-xs text-[hsl(var(--rdm-amber))] font-medium tracking-wider uppercase" style={{ fontFamily: "var(--font-body)" }}>{exp.subtitle}</span>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-white group-hover:text-[hsl(var(--rdm-amber))] transition-colors" style={{ fontFamily: "var(--font-display)" }}>{exp.title}</h3>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
