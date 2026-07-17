import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Compass, TreePine, Wind, Eye } from "lucide-react";
import sierraAdventure from "@/assets/sierra-adventure.jpg";
import waterfallForest from "@/assets/waterfall-forest.jpg";
import mistyMountains from "@/assets/misty-mountains.jpg";

const TRAILS = [
  {
    name: "Sendero de las Minas",
    difficulty: "Moderado",
    distance: "4.2 km",
    time: "2.5 hrs",
    desc: "Recorre las antiguas minas con guías locales expertos.",
  },
  {
    name: "Peña del Cuervo",
    difficulty: "Avanzado",
    distance: "6.8 km",
    time: "4 hrs",
    desc: "Mirador espectacular con vistas de 360° de la sierra.",
  },
  {
    name: "Bosque de Oyamel",
    difficulty: "Fácil",
    distance: "2.1 km",
    time: "1 hr",
    desc: "Caminata relajante entre bosques de niebla ancestrales.",
  },
];

export function AdventureSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const imgY = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);

  return (
    <section id="aventura" ref={ref} className="relative">
      {/* Full bleed */}
      <div className="relative h-[70vh] overflow-hidden">
        <motion.img
          style={{ y: imgY }}
          src={sierraAdventure}
          alt="Sierra de Pachuca"
          className="absolute inset-0 w-full h-[120%] object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background" />

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-16 lg:p-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-sm tracking-[0.3em] uppercase text-accent font-body mb-4">
              🏔️ Aventura
            </p>
            <h2 className="text-4xl md:text-7xl font-display font-bold leading-[0.9]">
              La sierra te
              <br />
              <span className="text-accent">espera</span>
            </h2>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 md:px-16 lg:px-24 py-20 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Image column */}
          <div className="lg:col-span-1 space-y-4">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="rounded-2xl overflow-hidden h-[240px]"
            >
              <img src={waterfallForest} alt="Cascada" loading="lazy" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="rounded-2xl overflow-hidden h-[240px]"
            >
              <img src={mistyMountains} alt="Montañas" loading="lazy" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
            </motion.div>
          </div>

          {/* Trails */}
          <div className="lg:col-span-2 flex flex-col justify-center">
            <p className="text-foreground/70 font-body text-lg leading-relaxed mb-4">
              A 2,700 metros sobre el nivel del mar, cada paso es una conquista.
              La bruma de la Sierra de Pachuca te envuelve como un abrazo ancestral
              mientras descubres senderos que conectan con siglos de historia.
            </p>
            <p className="text-foreground/70 font-body text-base leading-relaxed mb-10">
              Esta vertical combina aventura ligera, interpretación ambiental y paradas narrativas:
              miradores para fotografía romántica, rutas con memoria minera y travesías de baja
              complejidad pensadas para visitantes que quieren emoción sin perder seguridad.
            </p>

            <div className="space-y-4">
              {TRAILS.map((trail, i) => (
                <motion.div
                  key={trail.name}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group p-5 rounded-xl bg-card border border-border hover:border-accent/30 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-display font-bold text-lg group-hover:text-accent transition-colors">
                      {trail.name}
                    </h4>
                    <span className="text-xs px-2 py-1 rounded-full bg-accent/10 text-accent font-body font-medium">
                      {trail.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground font-body mb-3">{trail.desc}</p>
                  <div className="flex gap-4 text-xs text-muted-foreground font-body">
                    <span className="flex items-center gap-1"><Compass className="w-3 h-3" /> {trail.distance}</span>
                    <span className="flex items-center gap-1"><Wind className="w-3 h-3" /> {trail.time}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
