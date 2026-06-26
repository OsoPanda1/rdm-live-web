import { motion } from "framer-motion";
import { Palette, Gem, Scissors, Brush, CircleDot, Award } from "lucide-react";
import { RDMLayout } from "@/components/rdm/RDMLayout";
import { SEOMeta, PAGE_SEO } from "@/components/SEOMeta";
import callesImg from "@/assets/calles-colonial.webp";
import minaImg from "@/assets/mina-acosta.webp";
import rdm1 from "@/assets/rdm1.jpeg";
import rdm2 from "@/assets/rdm2.jpeg";
import rdm3 from "@/assets/rdm01.jpg";
import rdm4 from "@/assets/rdm02.jpg";

const crafts = [
  {
    title: "Platería Tradicional",
    icon: Gem,
    description: "Los artesanos de Real del Monte trabajan la plata utilizando técnicas heredadas de los mineros del siglo XIX. Desde aretes y collares hasta piezas de decoración, cada obra cuenta con minerales locales como adorno.",
    techniques: ["Filigrana", "Embossing", "Pulido tradicional", "Engaste de minerales"],
    materials: ["Plata .925", "Pirita", "Cuarzo", "Plata nativa"]
  },
  {
    title: "Textiles y Bordados",
    icon: Scissors,
    description: "Las artesanas locales crean piezas únicas que combinan diseños otomíes con influencias inglesas. Mantas, cojines y prendas de vestir bordadas a mano son algunas de sus creaciones.",
    techniques: ["Punto de cruz", "Bordado otomí", "Tejido en telar", "Ganchillo"],
    materials: ["Lana natural", "Hilo de algodón", "Seda", "Tintes naturales"]
  },
  {
    title: "Pintura y Escultura",
    icon: Brush,
    description: "Artistas locales capturan la esencia del pueblo en sus obras. Paisajes neblinosos, escenas mineras y retratos de personajes locales son temas recurrentes.",
    techniques: ["Óleo", "Acrílico", "Acuarela", "Escultura en cantera"],
    materials: ["Óleos", "Madera local", "Cantera", "Metal reciclado"]
  },
  {
    title: "Trabajos en Metal",
    icon: CircleDot,
    description: "Herreros y metalisteros crean desde herramientas decorativas hasta muebles y objetos de arte utilizando técnicas de forja tradicional.",
    techniques: ["Forja al carbón", "Soldadura artística", "Pátinas", "Damasco"],
    materials: ["Hierro", "Cobre", "Bronce", "Metal reciclado de minas"]
  }
];

const artists = [
  {
    name: "Familia Sánchez",
    specialty: "Platería",
    generation: "4ta Generación",
    description: "Maestros plateros con más de 100 años de tradición familiar creando joyería con minerales locales.",
    awards: ["Premio Nacional de Artesanías 2019", "Reconocimiento Estatal 2020"]
  },
  {
    name: "María Elena Torres",
    specialty: "Bordado Otomí",
    generation: "Artesana Master",
    description: "Preservadora de técnicas ancestrales de bordado que ha enseñado a más de 50 jóvenes del pueblo.",
    awards: ["Maestra Artesana Hidalgo", "Premio FONART 2018"]
  },
  {
    name: "Colectivo Minero",
    specialty: "Escultura en Metal",
    generation: "Grupo Fundado 2010",
    description: "Ex-mineros que transforman herramientas de trabajo en obras de arte, contando la historia del pueblo.",
    awards: ["Premio de Arte Contemporáneo", "Reconocimiento Municipal"]
  }
];

const workshops = [
  {
    name: "Taller de Platería Básica",
    duration: "4 horas",
    price: "$850 MXN",
    includes: ["Materiales", "Herramientas", "Pieza terminada"],
    description: "Aprende las técnicas básicas de trabajo con plata y crea tu propio anillo o aretes."
  },
  {
    name: "Bordado Tradicional",
    duration: "3 horas",
    price: "$600 MXN",
    includes: ["Kit de bordado", "Diseños tradicionales", "Certificado"],
    description: "Iniciación al bordado otomí-cornish con maestras artesanas locales."
  },
  {
    name: "Fotografía en la Neblina",
    duration: "6 horas",
    price: "$1,200 MXN",
    includes: ["Guía profesional", "Transporte", "Coffee break"],
    description: "Captura la atmósfera única de Real del Monte con un fotógrafo profesional."
  }
];

const ArtePage = () => {
  return (
    <RDMLayout>
      <div className="min-h-screen bg-background">
        <SEOMeta {...PAGE_SEO.arte} />
        
        {/* Hero */}
        <div className="relative h-[60vh] min-h-[500px] overflow-hidden">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${callesImg})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-black/40" />
          <div className="absolute inset-0 flex items-end pb-20">
            <div className="container mx-auto px-4 md:px-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-medium mb-4">
                  <Palette className="w-4 h-4" />
                  Creatividad Local
                </span>
                <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-4">
                  Arte y Artesanía
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl">
                  Descubre el talento de artesanos que fusionan tradición minera, herencia otomí 
                  y creatividad contemporánea en obras únicas.
                </p>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Crafts */}
        <section className="py-20">
          <div className="container mx-auto px-4 md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
                Nuestras Artesanías
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Tradiciones que se mantienen vivas a través del trabajo de maestros artesanos
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {crafts.map((craft, index) => (
                <motion.div
                  key={craft.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="glass rounded-2xl p-6 shadow-card hover:shadow-elevated transition-all"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-warm flex items-center justify-center">
                      <craft.icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <h3 className="font-serif text-xl font-bold text-foreground">{craft.title}</h3>
                  </div>

                  <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                    {craft.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">Técnicas</span>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {craft.techniques.map((tech) => (
                          <span key={tech} className="px-2 py-0.5 rounded bg-muted text-xs text-muted-foreground">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">Materiales</span>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {craft.materials.map((mat) => (
                          <span key={mat} className="px-2 py-0.5 rounded bg-muted text-xs text-muted-foreground">
                            {mat}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Artists */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
                Artistas Destacados
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Maestros que mantienen vivas las tradiciones artesanales
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {artists.map((artist, index) => (
                <motion.div
                  key={artist.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="glass rounded-2xl p-6 shadow-card text-center"
                >
                  <div className="w-20 h-20 rounded-full bg-gradient-warm mx-auto mb-4 flex items-center justify-center">
                    <Palette className="w-10 h-10 text-primary-foreground" />
                  </div>
                  <h3 className="font-serif text-lg font-bold text-foreground mb-1">{artist.name}</h3>
                  <span className="text-sm text-terracotta font-medium">{artist.specialty}</span>
                  <p className="text-xs text-muted-foreground mt-2 mb-4">{artist.generation}</p>
                  <p className="text-sm text-muted-foreground mb-4">{artist.description}</p>
                  
                  <div className="space-y-1">
                    {artist.awards.map((award) => (
                      <div key={award} className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                        <Award className="w-3 h-3 text-gold" />
                        <span>{award}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Workshops */}
        <section className="py-20">
          <div className="container mx-auto px-4 md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
                Talleres Disponibles
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Aprende de los maestros artesanos en experiencias prácticas
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {workshops.map((workshop, index) => (
                <motion.div
                  key={workshop.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="glass rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition-all"
                >
                  <div className="p-6">
                    <h3 className="font-serif text-lg font-bold text-foreground mb-2">
                      {workshop.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {workshop.description}
                    </p>

                    <div className="flex items-center justify-between text-sm mb-4">
                      <span className="text-muted-foreground">
                        <span className="font-medium text-foreground">{workshop.duration}</span>
                      </span>
                      <span className="text-xl font-bold text-terracotta">{workshop.price}</span>
                    </div>

                    <div className="space-y-1 mb-4">
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">Incluye:</span>
                      <div className="flex flex-wrap gap-1">
                        {workshop.includes.map((item) => (
                          <span key={item} className="px-2 py-0.5 rounded bg-muted text-xs">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button className="w-full py-2 rounded-lg bg-terracotta text-white text-sm font-medium hover:bg-terracotta/90 transition-colors">
                      Reservar plaza
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

      </div>
    </RDMLayout>
  );
};

export default ArtePage;
