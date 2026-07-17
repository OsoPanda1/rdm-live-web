import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { 
  Clock, Pickaxe, Flag, Users, Ship, Church, BookOpen, 
  Mountain, Gem, Crown, Scroll, Anchor, Compass, Flame,
  Building2, Scale, Landmark, Sparkles, MapPin, Ghost, AlertTriangle,
  Eye, Shield, Heart, Calendar
} from "lucide-react";
import { RDMLayout } from "@/components/rdm/RDMLayout";
import { SEOMeta, PAGE_SEO } from "@/components/SEOMeta";
import { TextReveal, ParallaxImage, StaggerContainer, StaggerItem } from "@/components/VisualEffects";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { VideoGallery } from "@/components/VideoGallery";
import { ImageGallery } from "@/components/ImageGallery";

// Assets
import minaImg from "@/assets/mina-acosta.webp";
import panteonImg from "@/assets/panteon-ingles.webp";
import callesImg from "@/assets/calles-colonial.webp";
import heroImg from "@/assets/hero-real-del-monte.webp";
import penasImg from "@/assets/penas-cargadas.webp";
import rdm1 from "@/assets/rdm1.jpeg";
import rdm2 from "@/assets/rdm2.jpeg";
import rdm3 from "@/assets/rdm01.jpg";
import rdm4 from "@/assets/rdm02.jpg";
import rdm5 from "@/assets/rdm03.jpg";

// Extended timeline with more historical depth
const timeline = [
  {
    year: "1534",
    title: "Primeras Exploraciones",
    description: "Exploradores españoles inician expediciones a la Sierra de Pachuca, atraídos por rumores de ricos yacimientos de plata en tierras otomíes.",
    icon: Compass,
    color: "bg-stone",
    details: "Las primeras expediciones fueron lideradas por conquistadores que escucharon relatos de los indígenas sobre montañas brillantes. Sin embargo, la topografía montañosa y la resistencia de los pueblos originales dificultaron el establecimiento inicial."
  },
  {
    year: "1560",
    title: "Descubrimiento de la Veta Madre",
    description: "Juan de Zúñiga y Juan de la Cruz descubren la veta madre de plata en la Sierra de Pachuca, dando origen al Real de Minas de Pachuca y el nacimiento oficial de la comunidad minera.",
    icon: Gem,
    color: "bg-terracotta",
    details: "El descubrimiento ocurrió en lo que hoy se conoce como Mina de San Antonio. La veta se extendía por kilómetros bajo la montaña, prometiendo riquezas incalculables. La Corona Española inmediatamente estableció el Real de Minas, un distrito minero con privilegios especiales."
  },
  {
    year: "1580",
    title: "Fundación del Real de Minas",
    description: "Se establece oficialmente el Real de Minas con la construcción de las primeras haciendas de beneficio y el trazado de las calles principales siguiendo el modelo colonial español.",
    icon: Building2,
    color: "bg-primary",
    details: "La fundación trajo consigo la construcción de la Iglesia de la Asunción, las primeras viviendas para mineros y las haciendas de beneficio donde se procesaba el mineral. La población comenzó a crecer rápidamente, atrayendo trabajadores de todo el centro de México."
  },
  {
    year: "1766",
    title: "La Llegada de los Cornish",
    description: "Inmigrantes de Cornualles, Inglaterra llegan a Real del Monte trayendo tecnología minera revolucionaria, steam engines, y una cultura que transformaría para siempre al pueblo.",
    icon: Ship,
    color: "bg-gold",
    details: "Bajo el mando de empresarios como John Rule y James Vetch, llegaron más de 150 familias cornish entre 1824 y 1840. Trajeron consigo bombas de vapor, trenes de mina, herramientas especializadas y conocimientos avanzados de ingeniería. También construyeron la primera estación de ferrocarril en México."
  },
  {
    year: "1824",
    title: "Independencia Económica",
    description: "Pedro Romero de Terreros compra las minas a la Corona Española, marcando el inicio de la minería independiente mexicana y una nueva era de prosperidad.",
    icon: Crown,
    color: "bg-forest",
    details: "Romero de Terreros, descendiente de la nobleza española pero mexicano de nacimiento, invirtió fortunas en modernizar las operaciones mineras. Bajo su administración, las minas alcanzaron niveles de producción nunca antes vistos, financiando proyectos de infraestructura en toda la región."
  },
  {
    year: "1850",
    title: "La Revolución del Paste",
    description: "Las pastelerías cornish-mexicanas se establecen formalmente, fusionando la receta del Cornish Pasty con ingredientes locales como el mole, frijol y chile, creando un ícono gastronómico único.",
    icon: Flame,
    color: "bg-terracotta",
    details: "Las esposas de los mineros ingleses comenzaron a preparar pasties para sus maridos, pero pronto las cocineras mexicanas adaptaron la receta con sabores locales. Así nació el paste mexicano, una fusión culinaria que solo existe en Real del Monte."
  },
  {
    year: "1900",
    title: "El Panteón Inglés",
    description: "Se consagra el Cementerio de los Anglicanos, hoy conocido como Panteón Inglés, el cementerio anglicano más alto del mundo a 2,700 metros sobre el nivel del mar.",
    icon: Landmark,
    color: "bg-stone",
    details: "El Panteón Inglés alberga tumbas que datan desde 1830 hasta 1960. Sus lápidas de mármol cuentan historias de amor, tragedia y aventura. Es el único cementerio en México donde se practican servicios anglicanos regulares y representa la memoria histórica de la comunidad cornish."
  },
  {
    year: "1930",
    title: "Era de la Nacionalización",
    description: "Las minas pasan a manos del gobierno mexicano. El auge minero declina, pero la comunidad encuentra nuevas formas de subsistencia preservando su patrimonio cultural.",
    icon: Scale,
    color: "bg-primary",
    details: "La nacionalización de la minería por parte del gobierno federal marcó el fin de una era. Muchas familias emigraron, pero las que se quedaron comenzaron a preservar conscientemente su patrimonio único. Se fundaron los primeros museos y comenzó el turismo cultural."
  },
  {
    year: "2004",
    title: "Nombramiento Pueblo Mágico",
    description: "Real del Monte es nombrado Pueblo Mágico por la Secretaría de Turismo, reconociendo su importancia histórica, cultural y arquitectónica única en México.",
    icon: Sparkles,
    color: "bg-gold",
    details: "El nombramiento de Pueblo Mágico vino acompañado de inversiones en infraestructura turística, restauración del centro histórico y programas de preservación cultural. Real del Monte se convirtió en destino internacional, atrayendo a visitantes de todo el mundo."
  },
  {
    year: "2024",
    title: "Bicentenario Cornish-Mexicano",
    description: "Celebración de 200 años de relación cultural entre Cornualles y Real del Monte, con eventos internacionales, intercambios culturales y el fortalecimiento de los lazos históricos.",
    icon: Anchor,
    color: "bg-forest",
    details: "El bicentenario marcó el retorno de descendientes de las familias cornish originales, la inauguración de nuevos espacios museísticos, y la consolidación de Real del Monte como un caso único de diáspora cultural en América Latina."
  }
];

// Heritage sections with extended content
const heritageSections = [
  {
    id: "mining",
    title: "Herencia Minera",
    subtitle: "El corazón de plata de México",
    description: "Real del Monte fue el distrito minero más importante de la Nueva España durante tres siglos. Las minas de Acosta, Dificultad, San Cayetano y Dolores produjeron toneladas de plata que financiaron guerras, construyeron naciones y atrajeron a aventureros de todo el mundo.",
    extendedDescription: `Las minas de Real del Monte fueron conocidas como "La Mina del Rey" durante la época colonial debido a la calidad excepcional de su mineral. La veta madre se extendía por más de 5 kilómetros bajo la montaña, con ramificaciones que llegaban hasta Pachuca.

La minería en Real del Monte revolucionó la industria mexicana. Aquí se introdujeron las primeras bombas de vapor de América Latina, los primeros ferrocarriles mineros, y las técnicas de perforación más avanzadas de la época. Los ingenieros formados en Real del Monte llevaron su conocimiento a otros distritos mineros de México y Sudamérica.

La plata de Real del Monte financió la Independencia de México, pagó deudas internacionales, y contribuyó al desarrollo de infraestructura en todo el país. Cada tonelada de mineral extraída representaba meses de trabajo en condiciones extremas, a más de 400 metros bajo tierra.`,
    image: minaImg,
    stats: [
      { label: "Años de historia minera", value: "460+" },
      { label: "Minas históricas documentadas", value: "35+" },
      { label: "Kilómetros de túneles", value: "500+" },
      { label: "Toneladas de plata extraídas", value: "80K+" }
    ],
    highlights: [
      "Mina de Acosta: La más profunda, con 460 metros de profundidad",
      "Sistema de drenaje más avanzado de su época en América",
      "Primera máquina de vapor en México, instalada en 1827",
      "Archivo minero con mapas y planos desde 1560"
    ]
  },
  {
    id: "cornish",
    title: "Legado Cornish",
    subtitle: "Una comunidad que transformó un pueblo",
    description: "La inmigración cornish dejó una huella indeleble en Real del Monte. Sus técnicas mineras, arquitectura victoriana, tradiciones religiosas, deportes y gastronomía se fusionaron con la cultura mexicana creando una identidad única en el mundo.",
    extendedDescription: `Entre 1824 y 1840, más de 3,000 cornish llegaron a Real del Monte, transformando un pueblo minero colonial en una comunidad bicultural única. Trajeron consigo no solo tecnología, sino toda una forma de vida.

La arquitectura victoriana de sus casas, con techos a dos aguas, jardines ornamentales y chimeneas características, contrastaba con la arquitectura colonial español. Construyeron su propia iglesia anglicana, club social, escuela, y cementerio.

Los cornish introdujeron el fútbol a México (el primer partido documentado fue en Real del Monte en 1900), la lucha greco-romana, los coros masculinos, y por supuesto, el paste. Sus descendientes, muchos con apellidos como Rule, Phillips, Harvey y Treviño, aún viven en el pueblo y preservan sus tradiciones.

La relación entre Cornualles y Real del Monte es tan especial que en 2008, el gobierno británico designó a Real del Monte como parte de la "Cornish Mining World Heritage Site", el único lugar fuera de Gran Bretaña con esta distinción.`,
    image: panteonImg,
    stats: [
      { label: "Inmigrantes cornish", value: "3,000+" },
      { label: "Familias establecidas", value: "150+" },
      { label: "Años de influencia", value: "200+" },
      { label: "Descendientes vivos hoy", value: "500+" }
    ],
    highlights: [
      "Única comunidad cornish en América Latina",
      "Primer partido de fútbol en México (1900)",
      "Primer ferrocarril en México (1829)",
      "Primer diario bilingüe español-inglés"
    ]
  },
  {
    id: "architecture",
    title: "Arquitectura Colonial",
    subtitle: "Caminar por las calles es viajar en el tiempo",
    description: "Las calles empedradas, casas con techos de teja roja, balcones de madera tallada, jardines florales y fachadas coloridas crean un ambiente que transporta al visitante al siglo XIX. El Centro Histórico está protegido por el INAH.",
    extendedDescription: `El Centro Histórico de Real del Monte comprende 12 manzanas de arquitectura colonial y victoriana perfectamente preservada. Las calles empedradas originales del siglo XVI siguen en uso, desgastadas por siglos de pisadas.

Las casas muestran la evolución arquitectónica del pueblo: las más antiguas, de adobe y techos de teja con patios interiores coloniales; las de la época de esplendor minero, con fachadas de cantera y balcones de madera; y las construidas por los ingleses, con influencias victorianas, jardines frontales y ventanas de guillotina.

El trazado del pueblo sigue el modelo de plaza central hispanoamericano, con la Parroquia de la Asunción como punto focal. Los callejones estrechos, las escalinatas de piedra, los arcos y los portales comerciales crean un ambiente único que ha sido escenario de numerosas producciones cinematográficas.

El INAH ha catalogado más de 200 edificios como patrimonio histórico, y la mayoría han sido restaurados respetando técnicas originales y materiales tradicionales.`,
    image: callesImg,
    stats: [
      { label: "Edificios históricos catalogados", value: "200+" },
      { label: "Manzanas del centro histórico", value: "12" },
      { label: "Año de fundación original", value: "1560" },
      { label: "Kilómetros de calles empedradas", value: "8" }
    ],
    highlights: [
      "Plaza Principal: Corazón social desde 1560",
      "Parroquia de la Asunción: Arquitectura barroca del siglo XVIII",
      "Portal del Comercio: Sigue siendo centro comercial",
      "Callejones románticos: Escenario de leyendas"
    ]
  },
  {
    id: "nature",
    title: "Geografía y Naturaleza",
    subtitle: "Un pueblo entre el bosque y la neblina",
    description: "Ubicado a 2,700 metros sobre el nivel del mar, Real del Monte está envuelto en bosque de oyamel y pino. La neblina que frecuentemente cubre el pueblo ha inspirado poetas, pintores y leyendas durante siglos.",
    extendedDescription: `Real del Monte se asienta en la Sierra de Pachuca, parte del Eje Neovolcánico Transversal. A 2,700 metros de altitud, es uno de los pueblos más altos de México, lo que explica su clima fresco y su característica neblina.

El bosque que rodea al pueblo es principalmente de oyamel (Abies religiosa), pino y encino. Este ecosistema alberga una biodiversidad única, incluyendo especies endémicas de orquídeas, hongos y mariposas. Durante el invierno, el bosque se transforma en un paisaje mágico cuando la nieve cubre los árboles.

La neblina es un elemento definitorio del paisaje realmontense. Se forma cuando las nubes del Golfo de México chocan con la sierra, creando un manto blanco que envuelve al pueblo. Los lugareños dicen que la neblina trae consigo "los susurros de los mineros del pasado".

Las formaciones rocosas como las Peñas Cargadas son testimonios geológicos de millones de años de erosión. Los manantiales de agua mineral, como el de San Antonio, han sido aprovechados desde la época prehispánica.`,
    image: penasImg,
    stats: [
      { label: "Altitud sobre el nivel del mar", value: "2,700m" },
      { label: "Hectáreas de bosque protegido", value: "12,000" },
      { label: "Especies de flora documentadas", value: "850+" },
      { label: "Días con neblina al año", value: "180+" }
    ],
    highlights: [
      "Bosque de oyamel: Hogar de la mariposa monarca",
      "Parque Ecoturístico Peñas Cargadas",
      "Manantiales de agua mineral natural",
      "Mirador La Cruz: Vista panorámica 360°"
    ]
  }
];

// Historical figures
const historicalFigures = [
  {
    name: "Ricardo Bell",
    role: "El Payaso que Hizo Reír a la Dictadura",
    period: "1881-1911",
    description: "Richard Bell Guest, el clown inglés que revolucionó el entretenimiento en México Porfiriano. Su personaje 'El Huácaro' hizo reír incluso al General Porfirio Díaz.",
    contribution: "Fundó el Gran Circo Bell y democratizó la risa en una época de represión. Su leyenda persiste en la tumba 55 del Panteón Inglés."
  },
  {
    name: "Pedro Romero de Terreros",
    role: "Empresario Minero",
    period: "1824-1860",
    description: "Conde de Regla y visionario empresario que modernizó la minería realmontense. Invirtió millones de pesos en tecnología de punta y mejoró las condiciones de los mineros.",
    contribution: 'Introdujo el sistema de "patentado" para distribuir ganancias entre los trabajadores'
  },
  {
    name: "John Rule",
    role: "Ingeniero Jefe",
    period: "1824-1835",
    description: "Ingeniero de Cornualles contratado para modernizar las operaciones mineras. Diseñó el sistema de drenaje más avanzado de América.",
    contribution: "Construyó la primera máquina de vapor en México y el primer ferrocarril"
  },
  {
    name: "Nicolás Zúñiga y Miranda",
    role: "Político y Escritor",
    period: "1863-1925",
    description: "Nacido en Real del Monte, se convirtió en figura política nacional. Escribió extensamente sobre la historia minera de su pueblo natal.",
    contribution: "Preservó documentos históricos y testimonios de la época minera dorada"
  },
  {
    name: "William Boyer",
    role: "Capellán Anglicano",
    period: "1850-1880",
    description: "Sacerdote anglicano que sirvió a la comunidad cornish durante 30 años. Fundó la escuela bilingüe y el coro de la iglesia.",
    contribution: "Dejó registros detallados de la vida cotidiana de la comunidad inglesa"
  }
];

// Video content
const historicalVideos = [
  {
    title: "Documental: 200 Años de Historia Cornish-Mexicana",
    thumbnail: minaImg,
    duration: "45:30",
    description: "Recorrido completo por la historia de la comunidad cornish en Real del Monte"
  },
  {
    title: "La Mina de Acosta: Descendiendo al Pasado",
    thumbnail: minaImg,
    duration: "18:45",
    description: "Recorrido en video por los túneles históricos de la mina más profunda"
  },
  {
    title: "Arquitectura y Leyendas del Centro Histórico",
    thumbnail: callesImg,
    duration: "25:20",
    description: "Caminata virtual por las calles empedradas y sus historias"
  },
  {
    title: "El Panteón Inglés: Memoria de una Comunidad",
    thumbnail: panteonImg,
    duration: "32:15",
    description: "Documental sobre el cementerio anglicano más alto del mundo"
  }
];

// Image gallery
const historicalImages = [
  { src: minaImg, alt: "Mina de Acosta", caption: "Entrada histórica de la Mina de Acosta" },
  { src: panteonImg, alt: "Panteón Inglés", caption: "Tumbas victorianas entre la neblina" },
  { src: callesImg, alt: "Calles Coloniales", caption: "Callejones empedrados del siglo XVI" },
  { src: heroImg, alt: "Vista Panorámica", caption: "Real del Monte desde el mirador" },
  { src: penasImg, alt: "Peñas Cargadas", caption: "Formaciones rocosas milenarias" },
];

const HistoriaPage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  return (
    <RDMLayout>
      <div ref={containerRef} className="min-h-screen bg-background overflow-x-hidden">
        <SEOMeta {...PAGE_SEO.historia} />
        
        {/* Hero Section with Parallax */}
        <div className="relative h-[85vh] min-h-[600px] overflow-hidden">
          <motion.div 
            className="absolute inset-0 -z-10"
            style={{ y: backgroundY }}
          >
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110"
              style={{ backgroundImage: `url(${heroImg})` }}
            />
          </motion.div>
          
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-black/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
          
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto px-4 md:px-8">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                className="max-w-3xl"
              >
                <motion.span 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-terracotta/20 text-terracotta text-sm font-medium mb-6 backdrop-blur-sm"
                >
                  <Clock className="w-4 h-4" />
                  Desde 1560 • 460+ años de historia
                </motion.span>
                
                <TextReveal>
                  <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold text-foreground mb-6 leading-[1.1]">
                    Historia de{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-terracotta via-gold to-terracotta">
                      Real del Monte
                    </span>
                  </h1>
                </TextReveal>
                
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed"
                >
                  Más de cuatro siglos de historia minera, donde la plata forjó no solo metales preciosos, 
                  sino una cultura única que fusiona lo mexicano con lo cornish. Un testimonio viviente 
                  del encuentro entre dos mundos.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                  className="flex flex-wrap gap-4 mt-8"
                >
                  <Button size="lg" className="bg-terracotta hover:bg-terracotta/90 text-white rounded-full px-8">
                    <Scroll className="w-4 h-4 mr-2" />
                    Explorar Línea del Tiempo
                  </Button>
                  <Button variant="outline" size="lg" className="rounded-full px-8 border-2">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Archivo Histórico
                  </Button>
                </motion.div>
              </motion.div>
            </div>
          </div>

          {/* Scroll indicator */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          >
            <span className="text-xs text-muted-foreground uppercase tracking-widest">Descubre</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-2"
            >
              <motion.div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
            </motion.div>
          </motion.div>
        </div>

        {/* Introduction Stats */}
        <section className="py-16 bg-gradient-to-b from-[hsl(var(--crystal-clear)/0.2)] to-[hsl(var(--crystal-clear)/0.05)]">
          <div className="container mx-auto px-4 md:px-8">
            <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: "1560", label: "Año de fundación" },
                { value: "200+", label: "Años de herencia cornish" },
                { value: "35+", label: "Minas históricas" },
                { value: "200+", label: "Edificios patrimonio" },
              ].map((stat, index) => (
                <StaggerItem key={index}>
                  <div className="text-center">
                    <div className="text-4xl md:text-5xl font-serif font-bold text-[hsl(var(--petrified-teal))] mb-2 drop-shadow-[0_0_15px_hsl(var(--petrified-teal)/0.3)]">
                      {stat.value}
                    </div>
                    <div className="text-sm text-[hsl(var(--deep-black))]/70 font-medium">{stat.label}</div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* Interactive Timeline */}
        <section className="py-24">
          <div className="container mx-auto px-4 md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="text-terracotta text-sm font-medium uppercase tracking-wider">Cronología</span>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mt-2 mb-4">
                Línea del Tiempo Histórica
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Los momentos que definieron la historia de este Pueblo Mágico, desde sus orígenes 
                mineros hasta su reconocimiento internacional.
              </p>
            </motion.div>

            <div className="relative max-w-5xl mx-auto">
              {/* Vertical line */}
              <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-terracotta via-gold to-forest md:-translate-x-1/2" />
              
                {timeline.map((item, index) => (
                  <motion.div
                    key={item.year}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ delay: index * 0.1, duration: 0.6 }}
                    className={`relative flex items-start gap-8 mb-16 last:mb-0 ${
                      index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                    }`}
                  >
                    {/* Content */}
                    <div className={`flex-1 ${index % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                      <div 
                        className={`crystal-card rounded-2xl p-6 ${index % 2 === 0 ? "md:ml-auto" : "md:mr-auto"} max-w-lg hover:shadow-elevated transition-shadow duration-300 ${index % 2 === 0 ? "hover:scale-[1.02]" : "hover:scale-[1.02]"}`}
                        style={{
                          background: 'linear-gradient(135deg, hsl(var(--crystal-clear)/0.9), hsl(var(--crystal-glow)/0.8))',
                          border: '1px solid hsl(var(--crystal-border)/0.6)',
                          boxShadow: '0 10px 40px hsl(var(--crystal-glow)/0.3), inset 0 0 30px hsl(var(--crystal-clear)/0.4)',
                          backdropFilter: 'blur(10px)',
                        }}
                      >
                        <span 
                          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[hsl(var(--crystal-clear)/0.8)] text-[hsl(var(--deep-black))] text-sm font-bold mb-3 border border-[hsl(var(--crystal-border)/0.4)] shadow-[0_0_15px_hsl(var(--crystal-glow)/0.3)]"
                          style={{
                            transition: 'all 0.3s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'hsl(var(--crystal-glow))';
                            e.currentTarget.style.color = 'white';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 0 25px hsl(var(--crystal-glow)/0.6)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'hsl(var(--crystal-clear)/0.8)';
                            e.currentTarget.style.color = 'hsl(var(--deep-black))';
                            e.currentTarget.style.transform = 'none';
                            e.currentTarget.style.boxShadow = '0 0 15px hsl(var(--crystal-glow)/0.3)';
                          }}
                        >
                          {item.year}
                        </span>
                        <h3 
                          className="font-serif text-xl font-bold text-[hsl(var(--deep-black))] mb-2 hover:text-[hsl(var(--petrified-teal))] transition-colors"
                          style={{
                            textShadow: '0 2px 10px hsl(var(--deep-black)/0.1)',
                          }}
                        >
                          {item.title}
                        </h3>
                        <p 
                          className="text-sm text-[hsl(var(--deep-black))/0.8] leading-relaxed mb-3 font-medium"
                          style={{
                            lineHeight: '1.7',
                          }}
                        >
                          {item.description}
                        </p>
                        <p 
                          className="text-xs text-[hsl(var(--deep-black))/0.7] leading-relaxed border-t border-[hsl(var(--crystal-border)/0.4)] pt-3"
                        >
                          {item.details}
                        </p>
                      </div>
                    </div>

                    {/* Icon */}
                    <div 
                      className="relative z-10 w-10 h-10 rounded-full bg-[hsl(var(--crystal-clear))] border-4 border-[hsl(var(--crystal-glow))] shadow-lg flex items-center justify-center shrink-0 hover:rotate-12 transition-transform duration-300"
                      style={{
                        boxShadow: '0 0 30px hsl(var(--crystal-glow)/0.5), inset 0 0 15px hsl(var(--crystal-glow)/0.3)',
                      }}
                    >
                      <div 
                        className={`w-4 h-4 rounded-full ${item.color} hover:scale-110 transition-transform duration-300`}
                        style={{
                          boxShadow: '0 0 20px currentColor',
                          filter: 'brightness(1.2)',
                        }}
                      />
                    </div>

                    {/* Spacer for alternating layout */}
                    <div className="flex-1 hidden md:block" />
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Heritage Tabs Section */}
          <section 
            className="py-24 bg-gradient-to-b from-[hsl(var(--crystal-clear)/0.3)] to-[hsl(var(--crystal-clear)/0.1)]"
            style={{
              backgroundImage: 'radial-gradient(circle at center top, hsl(var(--crystal-glow)/0.1), transparent 70%)',
            }}
          >
          <div className="container mx-auto px-4 md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="text-gold text-sm font-medium uppercase tracking-wider">Patrimonio</span>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mt-2 mb-4">
                Pilares de Nuestra Historia
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Cuatro dimensiones que definen la identidad única de Real del Monte
              </p>
            </motion.div>

            <Tabs defaultValue="mining" className="w-full">
              <TabsList className="w-full max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-4 mb-12">
                <TabsTrigger value="mining" className="data-[state=active]:bg-terracotta data-[state=active]:text-white">
                  <Pickaxe className="w-4 h-4 mr-2" />
                  Minería
                </TabsTrigger>
                <TabsTrigger value="cornish" className="data-[state=active]:bg-gold data-[state=active]:text-white">
                  <Ship className="w-4 h-4 mr-2" />
                  Cornish
                </TabsTrigger>
                <TabsTrigger value="architecture" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                  <Building2 className="w-4 h-4 mr-2" />
                  Arquitectura
                </TabsTrigger>
                <TabsTrigger value="nature" className="data-[state=active]:bg-forest data-[state=active]:text-white">
                  <Mountain className="w-4 h-4 mr-2" />
                  Naturaleza
                </TabsTrigger>
              </TabsList>

              {heritageSections.map((section) => (
                <TabsContent key={section.id} value={section.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="grid lg:grid-cols-2 gap-12 items-start"
                  >
                    <div className="order-2 lg:order-1">
                      <span className="text-terracotta text-sm font-medium uppercase tracking-wider">
                        {section.subtitle}
                      </span>
                      <h3 className="font-serif text-3xl md:text-4xl font-bold text-foreground mt-2 mb-4">
                        {section.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed mb-6">
                        {section.description}
                      </p>
                      <div className="prose prose-sm text-muted-foreground/80 whitespace-pre-line mb-8">
                        {section.extendedDescription}
                      </div>

                      {/* Highlights */}
                      <div className="space-y-3 mb-8">
                        {section.highlights.map((highlight, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-terracotta mt-2 shrink-0" />
                            <span className="text-sm text-muted-foreground">{highlight}</span>
                          </div>
                        ))}
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4">
                        {section.stats.map((stat, i) => (
                          <div key={i} className="p-4 rounded-xl bg-background border border-border">
                            <div className="text-2xl font-serif font-bold text-terracotta">{stat.value}</div>
                            <div className="text-xs text-muted-foreground">{stat.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="order-1 lg:order-2">
                      <ParallaxImage src={section.image} alt={section.title} />
                    </div>
                  </motion.div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </section>

        {/* Historical Figures */}
        <section className="py-24">
          <div className="container mx-auto px-4 md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="text-terracotta text-sm font-medium uppercase tracking-wider">Personajes</span>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mt-2 mb-4">
                Quienes Forjaron el Pueblo
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Figuras históricas que dejaron su huella indeleble en la historia de Real del Monte
              </p>
            </motion.div>

            <StaggerContainer className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {historicalFigures.map((figure, index) => (
                <StaggerItem key={index}>
                  <motion.div 
                    className="glass rounded-2xl p-6 hover:shadow-elevated transition-all duration-300"
                    whileHover={{ y: -4 }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-terracotta to-gold flex items-center justify-center shrink-0">
                        <span className="text-white font-serif text-lg font-bold">
                          {figure.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-serif text-lg font-bold text-foreground">{figure.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-terracotta mb-2">
                          <span>{figure.role}</span>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-muted-foreground">{figure.period}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{figure.description}</p>
                        <div className="p-3 rounded-lg"
                          style={{
                            background: 'linear-gradient(135deg, hsl(var(--crystal-clear)/0.7), hsl(var(--crystal-glow)/0.5))',
                            border: '1px solid hsl(var(--crystal-border)/0.4)',
                          }}
                        >
                          <span className="text-xs text-[hsl(var(--deep-black))/0.8]">
                            <strong>Legado:</strong> {figure.contribution}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* Ricardo Bell Legend Section */}
        <section className="py-24 bg-gradient-to-b from-background via-slate-950/20 to-background">
          <div className="container mx-auto px-4 md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="text-purple-500 text-sm font-medium uppercase tracking-wider flex items-center justify-center gap-2">
                <Ghost className="w-4 h-4" />
                Leyenda Urbana
              </span>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mt-2 mb-4">
                El Cisma de la Carcajada
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                La anatomía del mito de Ricardo Bell y la tumba apóstata del Panteón Inglés
              </p>
            </motion.div>

            <div className="max-w-4xl mx-auto">
              {/* Chapter I */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-12"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <span className="text-purple-500 font-serif font-bold">I</span>
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-foreground">
                    El Engendro de Deptford y el Exilio de la Pantomima
                  </h3>
                </div>
                <div className="glass rounded-2xl p-6 ml-13">
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    <strong className="text-foreground">Inglaterra, 1858.</strong> El humo industrial de Deptford asfixiaba los pulmones del proletariado victoriano. En este vientre de hollín nació Richard Bell Guest, hijo de James Bell, un clown itinerante escocés, y Emilia Guest, de sangre irlandesa.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Debutó a los dos años en Lyon, Francia. A lomos del Circo Chiarini en 1861, recorrió una Europa fragmentada. La Inglaterra de la Revolución Industrial era una maquinaria devoradora de almas. Para la élite británica, el payaso no era un artista; era un bufón despreciable.
                  </p>
                  <div className="mt-4 p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <p className="text-sm text-purple-400 font-medium">
                      <Calendar className="w-4 h-4 inline mr-2" />
                      1881: Bell cruza el Atlántico y arriba al México Porfiriano
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Chapter II */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="mb-12"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <span className="text-purple-500 font-serif font-bold">II</span>
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-foreground">
                    El "Huácaro" que Hizo Reír al Dictador
                  </h3>
                </div>
                <div className="glass rounded-2xl p-6 ml-13">
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Bell no fue un payaso convencional. Descartó la estridencia del clown rojo para abrazar al Pierrot melancólico. Se maquilló de blanco espectral, vistió el traje holgado y nació el <em>"huácaro"</em>. Su comedia no era de pastelazos, sino de crítica social fin��sima.
                  </p>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Con el Circo Orrín, Bell se convirtió en una deidad popular. <strong>Juan de Dios Peza</strong>, en <em>El Monitor Republicano</em>, sentenció: <em>"Es más popular que el pulque"</em>. Llenaba plazas enteras. Incluso el <strong>General Porfirio Díaz</strong>, un hombre de semblante pétreo, acudía a su palco solo para doblegarse ante la risa.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Badge variant="outline" className="border-purple-500/50 text-purple-400">
                      <Crown className="w-3 h-3 mr-1" /> Favorito del Dictador
                    </Badge>
                    <Badge variant="outline" className="border-purple-500/50 text-purple-400">
                      <Heart className="w-3 h-3 mr-1" /> Ícono Popular
                    </Badge>
                    <Badge variant="outline" className="border-purple-500/50 text-purple-400">
                      <Building2 className="w-3 h-3 mr-1" /> Gran Circo Bell (1907)
                    </Badge>
                  </div>
                </div>
              </motion.div>

              {/* Chapter III - The Legend */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="mb-12"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <span className="text-amber-500 font-serif font-bold">III</span>
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-foreground">
                    El Espejismo Cornish y el Pacto de la Neblina
                  </h3>
                </div>
                <div className="glass rounded-2xl p-6 ml-13 border-amber-500/30">
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Las giras del Circo Orrín lo llevarán a tocar la <strong>Comarca Minera</strong>: Pachuca y, finalmente, Real del Monte. El choque fue brutal. Bell no encontró nopales y desierto, sino un <em>"Little Cornwall"</em> incrustado en la sierra.
                  </p>
                  <blockquote className="border-l-4 border-amber-500 pl-4 my-6 italic text-foreground/80">
                    "Bell, embriagado por este sincretismo y acogido por la calidez ruda de los mineros, subió al Panteón Inglés. Allí, mirando las lápidas devotas al este, escupió su rebeldía. Compró un espacio por adelantado y juró: <em>'Cuando la muerte me alcance, entiérrenme dándole la espalda al país que me escupió'</em>."
                  </blockquote>
                </div>
              </motion.div>

              {/* Chapter IV - The Truth */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="mb-12"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-foreground">
                    La Cirugía a la Verdad
                  </h3>
                </div>
                <div className="glass rounded-2xl p-6 ml-13 bg-red-950/10 border-red-500/30">
                  <div className="flex items-center gap-2 mb-4">
                    <Eye className="w-5 h-5 text-red-400" />
                    <span className="text-red-400 font-medium">La respuesta histórica es: NO</span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Con el estallido de la Revolución Maderista en 1911, Bell huyó con su familia hacia Nueva York. Una tormenta de nieve empeoró su condición de salud. El domingo <strong>12 de marzo de 1911</strong>, a los 53 años, Ricardo Bell exhaló su último aliento. Fue sepultado en Nueva York. Su propia hija, Sylvia Bell, lo confirmó en su libro biográfico de 1984.
                  </p>
                  <div className="p-4 rounded-lg mb-4"
                    style={{
                      background: 'linear-gradient(135deg, hsl(var(--crystal-clear)/0.8), hsl(var(--crystal-glow)/0.6))',
                      border: '1px solid hsl(var(--crystal-border)/0.5)',
                      boxShadow: '0 5px 20px hsl(var(--crystal-glow)/0.2), inset 0 0 20px hsl(var(--crystal-clear)/0.3)',
                    }}
                  >
                    <h4 className="font-bold text-[hsl(var(--deep-black))] mb-2">El Enigma Resuelto:</h4>
                    <p className="text-sm text-[hsl(var(--deep-black))/0.8]">
                      La <strong>tumba 55</strong> pertenece en realidad a un minero británico llamado <strong>Richard Bell</strong>, originario de Middleton, Teesdale, Inglaterra. Este minero falleció el <strong>25 de octubre de 1875</strong>, a los 63 años. ¿Por qué está volteada? No fue un acto de rebeldía. La historia forense sugiere que un deslizamiento de tierra o un error de los sepultureros locales alteró la orientación de la cantera.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Chapter V - The Myth */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="mb-12"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-foreground">
                    La Transmutación Sociológica
                  </h3>
                </div>
                <div className="glass rounded-2xl p-6 ml-13">
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Si la historia es clara, <strong>¿por qué sobrevive la leyenda?</strong> Porque el pueblo de Real del Monte necesitaba que fuera verdad.
                  </p>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    La psicología colectiva hizo el resto. Fusionaron al minero anónimo con el ídolo popular. Inventaron el desprecio a Inglaterra para justificar el error topográfico de la tumba.
                  </p>
                  <div className="p-4 rounded-lg bg-gradient-to-r from-amber-500/20 to-purple-500/20 border border-amber-500/30 my-6">
                    <p className="text-foreground font-serif italic text-center">
                      "Nueva York guarda el polvo. Real del Monte resguarda el espíritu."
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Hay quienes juran que en las madrugadas heladas se escuchan las carcajadas de Bell rebotando entre los oyameles. Es la memoria viva.
                  </p>
                </div>
              </motion.div>

              {/* Call to Action */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <Button 
                  className="bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700 text-white rounded-full px-8"
                  onClick={() => window.location.href = '/mapa'}
                >
                  <MapPin className="w-4 h-4 mr-2" />
                  Visitar el Panteón Inglés
                </Button>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Multimedia Gallery */}
        <section className="py-24"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--crystal-clear)/0.25), transparent 60%)',
          }}
        >
          <div className="container mx-auto px-4 md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="text-gold text-sm font-medium uppercase tracking-wider">Multimedia</span>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mt-2 mb-4">
                Archivo Visual Histórico
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Imágenes y videos que capturan la esencia histórica de Real del Monte
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-12">
              <div>
                <h3 className="font-serif text-2xl font-bold text-foreground mb-6">Galería de Imágenes</h3>
                <ImageGallery />
              </div>
              <div>
                <h3 className="font-serif text-2xl font-bold text-foreground mb-6">Documentales y Videos</h3>
                <VideoGallery />
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-terracotta/10 via-background to-gold/10" />
          <div className="container mx-auto px-4 md:px-8 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto text-center"
            >
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
                Sé Parte de la Historia
              </h2>
              <p className="text-muted-foreground mb-8">
                Visita Real del Monte y camina por las mismas calles donde mineros, inmigrantes y 
                soñadores forjaron una de las historias más fascinantes de México.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" className="bg-terracotta hover:bg-terracotta/90 text-white rounded-full px-8">
                  <MapPin className="w-4 h-4 mr-2" />
                  Planificar Visita
                </Button>
                <Button variant="outline" size="lg" className="rounded-full px-8 border-2">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Descargar Guía Histórica
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

      </div>
    </RDMLayout>
  );
};

export default HistoriaPage;
