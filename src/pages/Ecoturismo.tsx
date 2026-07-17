import { motion } from "framer-motion";
import { TreePine, Mountain, Footprints, Tent, Camera, Binoculars, Sun, CloudFog } from "lucide-react";
import { RDMLayout } from "@/components/rdm/RDMLayout";
import { SEOMeta, PAGE_SEO } from "@/components/SEOMeta";
import penasImg from "@/assets/penas-cargadas.webp";
import callesImg from "@/assets/calles-colonial.webp";
import minaImg from "@/assets/mina-acosta.webp";
import rdm1 from "@/assets/rdm1.jpeg";
import rdm2 from "@/assets/rdm2.jpeg";
import rdm3 from "@/assets/rdm01.jpg";
import rdm4 from "@/assets/rdm02.jpg";
import callesJpg from "@/assets/calles.jpg";
import heroPrincipalPng from "@/assets/heroprincipal.png";
import laDificultadImg from "@/assets/ladificultad.jpg";
import miradorPurisimaImg from "@/assets/mirador_purisima.jpg";
import rdmInfografia from "@/assets/rdm-infografia.png";

const activities = [
  {
    title: "Senderismo a Peñas Cargadas",
    difficulty: "Moderada",
    duration: "3-4 horas",
    distance: "5 km",
    description: "Ascenso a las impresionantes formaciones rocosas que parecen desafiar la gravedad. El recorrido ofrece vistas panorámicas del valle y bosque de oyamel.",
    image: penasImg,
    highlights: ["Vistas panorámicas", "Formaciones rocosas", "Bosque de niebla", "Fotografía"],
    bestTime: "Abril - Noviembre"
  },
  {
    title: "Caminata Histórica Centro",
    difficulty: "Fácil",
    duration: "2 horas",
    distance: "3 km",
    description: "Recorrido por las calles empedradas del Centro Histórico visitando puntos de interés arquitectónico y cultural, incluyendo el Panteón Inglés.",
    image: callesImg,
    highlights: ["Arquitectura colonial", "Panteón Inglés", "Plaza Principal", "Museos"],
    bestTime: "Todo el año"
  },
  {
    title: "Tour de Minas Acosta",
    difficulty: "Moderada",
    duration: "2 horas",
    distance: "1 km",
    description: "Descenso de 450 metros bajo tierra en la mina más famosa del distrito. Incluye explicación de técnicas mineras históricas y actuales.",
    image: minaImg,
    highlights: ["Túneles históricos", "Museo minero", "Experiencia subterránea", "Guía especializado"],
    bestTime: "Todo el año"
  },
  {
    title: "Observación de Neblina",
    difficulty: "Fácil",
    duration: "Variable",
    distance: "Libre",
    description: "Real del Monte es famoso por su neblina etérea. Los mejores puntos para observar este fenómeno natural son los miradores al amanecer y atardecer.",
    image: miradorPurisimaImg,
    highlights: ["Fotografía artística", "Atmósfera mística", "Miradores", "Amanecer/Atardecer"],
    bestTime: "Junio - Septiembre"
  },
  {
    title: "Recorrido Fotográfico Urbano",
    difficulty: "Fácil",
    duration: "2-3 horas",
    distance: "2.5 km",
    description: "Explora las calles empedradas y la arquitectura colonial de Real del Monte. Ideal para fotografía de arquitectura y vida cotidiana del pueblo mágico.",
    image: callesJpg,
    highlights: ["Arquitectura", "Calles empedradas", "Fotografía urbana", "Cultura local"],
    bestTime: "Todo el año"
  },
  {
    title: "Ruta del Minero",
    difficulty: "Difícil",
    duration: "4-5 horas",
    distance: "8 km",
    description: "Desafiante ruta que sigue los pasos de los antiguos mineros. Atraviesa terrenos irregulares, túneles abandonados y ofrece vistas de la sierra que pocos conocen.",
    image: laDificultadImg,
    highlights: ["Túneles históricos", "Terreno desafiante", "Vistas únicas", "Historia minera"],
    bestTime: "Octubre - Marzo"
  }
];

const floraFauna = [
  {
    category: "Flora",
    items: [
      { name: "Oyamel", description: "Abies religiosa, árbol símbolo de la región" },
      { name: "Pino Amarillo", description: "Pinus montezumae, predominante en la zona" },
      { name: "Encino", description: "Quercus spp., bosques de galería" },
      { name: "Wildflowers", description: "Diversas especies de orquídeas y flores silvestres" }
    ]
  },
  {
    category: "Fauna",
    items: [
      { name: "Zorrillo", description: "Spilogale sp., habitante nocturno frecuente" },
      { name: "Ardilla", description: "Sciurus aureogaster, común en áreas boscosas" },
      { name: "Tecolote", description: "Otus spp., búhos que habitan la zona" },
      { name: "Colibríes", description: "Diversas especies, especialmente en jardines florales" }
    ]
  }
];

const tips = [
  {
    icon: Sun,
    title: "Clima Variable",
    description: "La temperatura puede cambiar drásticamente. Lleva capas de ropa y algo impermeable."
  },
  {
    icon: Footprints,
    title: "Calzado Apropiado",
    description: "Botas de senderismo con buen agarre son esenciales, especialmente para Peñas Cargadas."
  },
  {
    icon: CloudFog,
    title: "Niebla Frecuente",
    description: "La neblina puede reducir la visibilidad. Permanece en los senderos marcados."
  },
  {
    icon: Camera,
    title: "Fotografía",
    description: "Las mejores fotos son al amanecer y atardecer cuando la neblina crea atmósferas únicas."
  }
];

const EcoturismoPage = () => {
  return (
    <RDMLayout>
      <div className="min-h-screen bg-background">
        <SEOMeta {...PAGE_SEO.ecoturismo} />
        
        {/* Hero */}
        <div className="relative h-[60vh] min-h-[500px] overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${penasImg})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-black/40" />
          <div className="absolute inset-0 flex items-end pb-20">
            <div className="container mx-auto px-4 md:px-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest/20 text-forest text-sm font-medium mb-4">
                  <TreePine className="w-4 h-4" />
                  Naturaleza y Aventura
                </span>
                <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-4">
                  Ecoturismo
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl">
                  Explora bosques de oyamel, formaciones rocosas milenarias y paisajes envueltos en neblina 
                  en este santuario natural a 2,700 metros de altura.
                </p>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Activities */}
        <section className="py-20">
          <div className="container mx-auto px-4 md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
                Actividades al Aire Libre
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Desde caminatas históricas hasta expediciones a formaciones rocosas únicas
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-8">
              {activities.map((activity, index) => (
                <motion.div
                  key={activity.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="glass rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition-shadow"
                >
                  <div className="relative h-56 overflow-hidden">
                    <img 
                      src={activity.image}
                      alt={activity.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-1 rounded-lg bg-white/20 backdrop-blur-sm text-white text-xs">
                          {activity.difficulty}
                        </span>
                        <span className="px-2 py-1 rounded-lg bg-white/20 backdrop-blur-sm text-white text-xs">
                          {activity.duration}
                        </span>
                        <span className="px-2 py-1 rounded-lg bg-white/20 backdrop-blur-sm text-white text-xs">
                          {activity.distance}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="font-serif text-xl font-bold text-foreground mb-2">
                      {activity.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                      {activity.description}
                    </p>

                    <div className="mb-4">
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">Destacados:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {activity.highlights.map((highlight) => (
                          <span 
                            key={highlight}
                            className="px-2 py-1 rounded-lg bg-forest/10 text-forest text-xs"
                          >
                            {highlight}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <span className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">Mejor época:</span> {activity.bestTime}
                      </span>
                      <button className="px-4 py-2 rounded-lg bg-forest text-white text-sm font-medium hover:bg-forest/90 transition-colors">
                        Reservar
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Flora and Fauna */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
                Flora y Fauna
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Especies nativas del bosque de niebla de la Sierra de Pachuca
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {floraFauna.map((section, index) => (
                <motion.div
                  key={section.category}
                  initial={{ opacity: 0, x: index === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="glass rounded-2xl p-6 shadow-card"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-forest flex items-center justify-center">
                      {section.category === "Flora" ? (
                        <TreePine className="w-5 h-5 text-white" />
                      ) : (
                        <Binoculars className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <h3 className="font-serif text-xl font-bold text-foreground">
                      {section.category}
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {section.items.map((item) => (
                      <div key={item.name} className="p-4 rounded-xl bg-background">
                        <h4 className="font-semibold text-foreground mb-1">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Tips Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
                Recomendaciones
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Consejos para disfrutar de manera segura y responsable
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {tips.map((tip, index) => (
                <motion.div
                  key={tip.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-14 h-14 rounded-2xl bg-forest/10 flex items-center justify-center mx-auto mb-4">
                    <tip.icon className="w-7 h-7 text-forest" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{tip.title}</h3>
                  <p className="text-sm text-muted-foreground">{tip.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA dual */}
        <section className="py-20 space-y-8">
          <div className="container mx-auto px-4 md:px-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative rounded-3xl overflow-hidden"
            >
              <img 
                src={heroPrincipalPng}
                alt="Real del Monte"
                loading="lazy" className="w-full h-[400px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-forest/90 to-forest/70 flex items-center">
                <div className="px-8 md:px-16 max-w-xl">
                  <Tent className="w-12 h-12 text-white mb-4" />
                  <h2 className="font-serif text-3xl md:text-4xl font-bold text-white mb-4">
                    ¿Listo para la aventura?
                  </h2>
                  <p className="text-white/80 mb-6">
                    Descubre los tours guiados con expertos locales que conocen cada rincón 
                    de la sierra y sus secretos mejor guardados.
                  </p>
                  <button className="px-8 py-3 rounded-xl bg-white text-forest font-semibold hover:bg-white/90 transition-colors">
                    Ver tours disponibles
                  </button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Infografía */}
          <div className="container mx-auto px-4 md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass rounded-2xl p-6 text-center"
            >
              <img
                src={rdmInfografia}
                alt="Infografía Real del Monte"
                loading="lazy" className="max-w-full h-auto mx-auto rounded-xl"
                style={{ maxHeight: "500px" }}
              />
              <p className="text-xs text-muted-foreground mt-4">
                Datos y cifras de Real del Monte — Un pueblo mágico con historia minera
              </p>
            </motion.div>
          </div>
        </section>

      </div>
    </RDMLayout>
  );
};

export default EcoturismoPage;
