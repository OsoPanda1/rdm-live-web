import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { 
  Music, Palette, Calendar, Users, Sparkles, Camera, Theater, 
  Crown, Flame, Moon, Sun, Wind, Heart, Star, Globe,
  Church, BookOpen, Flower2, GlassWater, Gift, Scroll
} from "lucide-react";
import { RDMLayout } from "@/components/rdm/RDMLayout";
import { SEOMeta, PAGE_SEO } from "@/components/SEOMeta";
import { TextReveal, ParallaxImage, StaggerContainer, StaggerItem, GlowCard } from "@/components/VisualEffects";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ImageGallery } from "@/components/ImageGallery";

// Assets
import callesImg from "@/assets/calles-colonial.webp";
import panteonImg from "@/assets/panteon-ingles.webp";
import heroImg from "@/assets/hero-real-del-monte.webp";
import penasImg from "@/assets/penas-cargadas.webp";
import rdm1 from "@/assets/rdm1.jpeg";
import rdm2 from "@/assets/rdm2.jpeg";
import rdm3 from "@/assets/rdm01.jpg";
import rdm4 from "@/assets/rdm02.jpg";
import pasteImg from "@/assets/paste.webp";

// Extended festivals with more detail
const festivals = [
  {
    id: "paste",
    name: "Festival Internacional del Paste",
    month: "Octubre",
    date: "Segundo fin de semana de octubre",
    description: "El evento gastronómico y cultural más importante del año. Durante tres días, el pueblo celebra su icónico platillo con más de 50 expositores, concursos, música en vivo y actividades para toda la familia.",
    fullDescription: `El Festival Internacional del Paste es mucho más que una celebración gastronómica. Es el momento en que Real del Monte rinde homenaje a su herencia cornish-mexicana y comparte esta tradición única con visitantes de todo el mundo.

Durante el festival, las calles del centro histórico se transforman en un escenario vivo donde pasteleros locales e internacionales compiten por el título de "Mejor Paste del Año". Los visitantes pueden degustar más de 50 variedades diferentes, desde el tradicional de papa con carne hasta creaciones innovadoras con ingredientes locales.

El evento incluye conciertos de bandas de viento, danzas folklóricas, exposiciones artesanales, y el tradicional desfile donde participan carros alegóricos inspirados en la historia minera. El clímax llega con la coronación de la "Reina del Paste" y el concurso de comelones, donde los valientes compiten por ver quién come más pastes en 10 minutos.`,
    activities: [
      "Concurso del Mejor Paste Tradicional",
      "Competencia de Comelones de Paste",
      "Coronación de la Reina del Paste",
      "Conciertos de Bandas de Viento",
      "Exposición de Artesanías Mineras",
      "Talleres de Elaboración de Paste",
      "Recorridos Históricos Guiados",
      "Espectáculo de Luz y Sonido"
    ],
    culturalSignificance: "El festival representa la fusión perfecta entre la tradición cornish del Cornish Pasty y la creatividad mexicana, creando un evento único en el mundo que atrae a más de 50,000 visitantes anualmente."
  },
  {
    id: "muertos",
    name: "Día de Muertos en el Panteón Inglés",
    month: "Noviembre",
    date: "1 y 2 de noviembre",
    description: "Una celebración única en el mundo que fusiona tradiciones mexicanas del Día de Muertos con rituales anglicanos y celtas. Velas, flores de cempasúchil, rezos en inglés y español en un ambiente mágico entre la neblina.",
    fullDescription: `El Día de Muertos en el Panteón Inglés es posiblemente la celebración más emotiva y única de Real del Monte. En este lugar sagrado, donde descansan los restos de los mineros cornish y sus familias, las tradiciones mexicanas y anglicanas se entrelazan de manera sublime.

La celebración comienza el 31 de octubre con la "Vigilia de las Ánimas", donde voluntarios colocan velas en cada una de las tumbas. La neblina que habitualmente envuelve el panteón crea una atmósfera etérea que parece sacada de una película.

El 1 de noviembre, Día de Todos los Santos, se celebra una misa anglicana bilingüe en la capilla del panteón. Descendientes de las familias originales viajan desde Cornualles, Inglaterra, para honrar a sus antepasados. Las ofrendas combinan elementos mexicanos (cempasúchil, pan de muerto, copal) con simbolismo celta (tréboles, cruces celtas, piedras de río).

El 2 de noviembre culmina con el "Festival de las Luces", donde cientos de velas iluminan el cementerio mientras el coro interpreta canciones tradicionales cornish y mexicanas.`,
    activities: [
      "Vigilia de las Ánimas con encendido de velas",
      "Misa Anglicana Bilingüe",
      "Recorridos Nocturnos con Leyendas",
      "Ofrendas Biculturales",
      'Concierto del Coro "Voices of the Mines"',
      "Ceremonia Celta de Samhain",
      "Conteo de Historias Familiares",
      "Liberación de Faroles Flotantes"
    ],
    culturalSignificance: "Es el único lugar en México donde se practica una síntesis auténtica de rituales mexicanos y anglicanos, reconocido por la UNESCO como ejemplo de diálogo intercultural."
  },
  {
    id: "semanasanta",
    name: "Semana Santa Minera",
    month: "Marzo/Abril",
    date: "Fecha variable (Semana Santa)",
    description: "Procesiones que recorren las calles empedradas del centro histórico, representando la Pasión de Cristo con elementos distintivos de la tradición minera. Los penitentes visten túnicas que recuerdan a los mineros de antaño.",
    fullDescription: `La Semana Santa en Real del Monte es una experiencia singular donde la devoción religiosa se entrelaza con la memoria de los mineros que arriesgaron sus vidas bajo tierra. Las celebraciones comienzan el Domingo de Ramos y culminan el Domingo de Resurrección.

El Jueves Santo tiene lugar la "Procesión del Silencio Minero", una de las más emotivas de México. Los participantes, vestidos con túnicas negras que evocan el uniforme de los mineros, portan herramientas mineras como lámparas de carburo, picos y cascos en lugar de los tradicionales cirios. El silencio solo se rompe por el sonido de las campanas y los golpes sordos que imitan el trabajo en las minas.

El Viernes Santo, la "Procesión de la Cruz de Plata" lleva una réplica de la cruz labrada en plata pura que los mineros dedicaron a su santo patrón. Esta cruz, originalmente colocada en la Mina de Acosta en 1850, simboliza la fe de quienes arriesgaban sus vidas bajo tierra.

Durante toda la semana, se realizan representaciones teatrales de la Pasión en escenarios naturales, conciertos de música sacra en la iglesia, y la tradicional "Feria de la Plata" donde artesanos venden joyería inspirada en la minería.`,
    activities: [
      "Procesión del Silencio Minero",
      "Procesión de la Cruz de Plata",
      "Representación Teatral de la Pasión",
      "Conciertos de Música Sacra",
      "Feria de la Plata Artesanal",
      "Visitas Guiadas a Templos Históricos",
      "Exposición de Arte Religioso Colonial",
      "Encuentro de Bandas de Viento"
    ],
    culturalSignificance: "Representa la síntesis entre la fe católica y la identidad minera, mostrando cómo la religión fue fundamental para una comunidad que vivía en constante peligro bajo tierra."
  },
  {
    id: "feriaplata",
    name: "Feria de la Plata",
    month: "Agosto",
    date: "Primera quincena de agosto",
    description: "Celebración del metal que dio origen al pueblo. Exposición de joyería, minerales, competencias, conferencias académicas y eventos que honran la herencia minera de Real del Monte.",
    fullDescription: `La Feria de la Plata es el homenaje anual al metal que construyó Real del Monte. Durante dos semanas, el pueblo se transforma en un centro de exposición minera, cultural y académico que atrae a geólogos, historiadores, joyeros y turistas.

El evento central es la "Exposición Internacional de Minerales", donde coleccionistas de todo el mundo exhiben especímenes únicos de plata nativa, acanthita, y otros minerales encontrados en las minas locales. La exposición incluye piezas históricas que datan de la época colonial.

Uno de los momentos más esperados es el "Concurso Nacional de Joyería Minera", donde orfebres compiten creando piezas inspiradas en la tradición minera. Los diseños ganadores se exhiben en el Museo del Paste y la Plata durante todo el año.

La feria incluye también conferencias académicas sobre historia minera, talleres de joyería para niños, recorridos especiales a las minas, y el tradicional "Encuentro de Mineros", donde veteranos comparten historias de su trabajo bajo tierra. La clausura incluye un espectacular show de fuegos artificiales desde la cima de la Mina de Acosta.`,
    activities: [
      "Exposición Internacional de Minerales",
      "Concurso Nacional de Joyería Minera",
      "Conferencias de Historia y Geología",
      "Recorridos Especiales a Minas",
      "Encuentro de Mineros Veteranos",
      "Talleres de Joyería para Niños",
      "Subasta de Piezas Históricas",
      "Espectáculo de Fuegos Artificiales"
    ],
    culturalSignificance: "Mantiene viva la memoria de la industria que dio origen al pueblo, educando a las nuevas generaciones sobre la importancia histórica de la minería."
  },
  {
    id: "cornish",
    name: "Festival Cornish-Mexicano",
    month: "Julio",
    date: "Último fin de semana de julio",
    description: "Celebración anual de la herencia británica del pueblo. Música celta, danzas tradicionales, comida típica de Cornualles, rugby, y la visita de delegaciones desde Inglaterra.",
    fullDescription: `El Festival Cornish-Mexicano celebra el legado único de la inmigración inglesa que transformó Real del Monte. Es el evento que más fortalece los lazos con Cornualles, con la participación anual de delegaciones oficiales del condado británico.

El festival comienza con el "Desfile de las Dos Naciones", donde participantes vestidos con trajes típicos mexicanos y cornish desfilan por las calles principales. La banda de música toca una mezcla de marchas mineras mexicanas y melodías celtas.

Durante el fin de semana se realizan conciertos de música celta, talleres de bailes tradicionales cornish, exhibiciones de deportes como el rugby y la lucha greco-romana (introducidos por los ingleses), y la tradicional "Cena de los Cornish Pasties" donde se sirven pastes preparados según recetas originales traídas desde Inglaterra.

Un momento especial es la "Ceremonia de las Flores", donde descendientes de familias cornish y mexicanas intercambian flores de cempasúchil y rosas inglesas como símbolo de amistad. El festival concluye con un concierto de despedida donde suenan las canciones que los mineros cantaban en los túneles.`,
    activities: [
      "Desfile de las Dos Naciones",
      "Conciertos de Música Celta",
      "Talleres de Bailes Tradicionales",
      "Exhibición de Rugby Histórico",
      "Cena de los Cornish Pasties",
      "Ceremonia de las Flores",
      "Visita guiada al Panteón Inglés",
      "Encuentro de Descendientes"
    ],
    culturalSignificance: "Es el único festival de su tipo en América Latina, manteniendo vivos los lazos culturales con Cornualles y preservando tradiciones que de otra forma se habrían perdido."
  }
];

// Cultural expressions
const culturalExpressions = [
  {
    category: "Música",
    icon: Music,
    items: [
      {
        title: "Bandas de Viento",
        description: "Herencia de las bandas mineras que animaban las fiestas de los trabajadores. Las bandas de Real del Monte son famosas en toda la región y tocan en todas las celebraciones.",
        significance: "Las bandas de viento surgieron como entretenimiento para los mineros después de sus duras jornadas laborales. Hoy, las bandas juveniles continúan la tradición."
      },
      {
        title: "Coros Cornish",
        description: 'Los coros masculinos fueron introducidos por la comunidad inglesa. El Coro "Voices of the Mines" sigue activo y canta canciones tradicionales en inglés y español.',
        significance: "Los coros eran parte esencial de la vida comunitaria británica y se mantuvieron como tradición única en Real del Monte."
      },
      {
        title: "Música Celta",
        description: "Grupos locales interpretan música tradicional de Cornualles, Gales e Irlanda, manteniendo viva la herencia musical de los inmigrantes.",
        significance: 'La música celta se ha fusionado con ritmos mexicanos creando un estilo único conocido como "Celta-Mex".'
      }
    ]
  },
  {
    category: "Danza",
    icon: Theater,
    items: [
      {
        title: "Ballet Folclórico Minero",
        description: "Danzas que cuentan la historia de la minería, la llegada de los ingleses y la vida en la sierra. Coreografías originales creadas por maestros locales.",
        significance: "Las danzas preservan movimientos que imitan el trabajo minero: picar la roca, arrastrar carros, encender lámparas."
      },
      {
        title: "Danza de los Pastes",
        description: "Coreografía especial creada para el Festival del Paste que representa el proceso de elaboración de este platillo icónico.",
        significance: "Una danza única en el mundo que celebra un platillo específico de la gastronomía local."
      },
      {
        title: "Bailes Celtas",
        description: 'Talleres regulares de danzas tradicionales cornish como el "Furry Dance" y el "Flora Day", preservados por descendientes de las familias originales.',
        significance: "Real del Monte es el único lugar fuera de Cornualles donde estas danzas se practican regularmente."
      }
    ]
  },
  {
    category: "Artes Visuales",
    icon: Palette,
    items: [
      {
        title: "Pintura de Paisaje",
        description: "Artistas locales capturan la belleza del bosque de niebla, las neblinas matinales y la arquitectura colonial. La Escuela de Pintura de Real del Monte tiene más de 50 años.",
        significance: "El paisaje único de Real del Monte ha inspirado a generaciones de pintores mexicanos e internacionales."
      },
      {
        title: "Escultura en Metal",
        description: "Artistas trabajan con cobre, plata y hierro creando piezas inspiradas en herramientas mineras y figuras históricas.",
        significance: "Uso de materiales locales para crear arte que honra la herencia minera del pueblo."
      },
      {
        title: "Fotografía Documental",
        description: "El pueblo ha sido escenario de innumerables proyectos fotográficos que documentan su arquitectura, tradiciones y gentes.",
        significance: "El archivo fotográfico de Real del Monte es uno de los más importantes de pueblos mágicos de México."
      }
    ]
  },
  {
    category: "Artesanía",
    icon: Gift,
    items: [
      {
        title: "Joyería Minera",
        description: "Orfebres locales crean piezas usando técnicas tradicionales e inspirándose en herramientas mineras, minerales y símbolos de la comunidad cornish.",
        significance: "Cada pieza cuenta una historia de la minería y la fusión cultural del pueblo."
      },
      {
        title: "Alfarería Tradicional",
        description: "Cerámica hecha con técnicas prehispánicas y coloniales, especialmente ollas para guisos y objetos decorativos.",
        significance: "Preservación de técnicas ancestrales que se combinan con diseños inspirados en la minería."
      },
      {
        title: "Talla en Madera",
        description: "Artesanos tallan muebles, máscaras y objetos decorativos usando maderas locales como el oyamel y el pino.",
        significance: "Las piezas de madera tallada son características de las casas históricas del pueblo."
      }
    ]
  }
];

// Traditions and customs
const traditions = [
  {
    title: "La Neblina como Personaje",
    description: "En Real del Monte, la neblina no es solo un fenómeno meteorológico, sino un elemento cultural. Existen leyendas, poemas, canciones y tradiciones relacionadas con la neblina que cubre el pueblo más de 180 días al año.",
    icon: Wind
  },
  {
    title: "El Culto a la Plata",
    description: "Aunque la minería ya no es la principal actividad, la plata sigue siendo reverenciada. Se realizan ceremonias de agradecimiento a la tierra y existe un profundo respeto por las minas como patrimonio histórico.",
    icon: Sparkles
  },
  {
    title: "Las Historias de Mineros",
    description: "La tradición oral es vital. Los ancianos cuentan historias de sus experiencias en las minas a las nuevas generaciones, preservando no solo hechos históricos sino también valores como el compañerismo y el coraje.",
    icon: BookOpen
  },
  {
    title: "El Respeto por los Difuntos",
    description: "Las tradiciones funerarias combinan elementos católicos, anglicanos y prehispánicos. El Día de Muertos se celebra tanto en el panteón católico como en el anglicano, reconociendo la diversidad religiosa del pueblo.",
    icon: Moon
  }
];

// Gastronomic culture
const gastronomicCulture = {
  title: "Cultura del Paste",
  description: "El paste no es solo comida en Real del Monte; es un símbolo de identidad cultural. Representa la fusión perfecta entre la tradición cornish y la creatividad mexicana.",
  aspects: [
    {
      title: "El Arte de Hacer Paste",
      description: "Las familias pastelesas guardan celosamente sus recetas, transmitiéndolas de generación en generación. El proceso de elaboración es un ritual que incluye técnicas específicas de amasado, reposo y horneado."
    },
    {
      title: "El Repujado de la Masa",
      description: "El característico borde de la masa del paste no es solo decorativo; tiene un origen práctico. Los mineros sostenían el paste por el borde para no contaminar la comida con sus manos sucias de carbón."
    },
    {
      title: "Variedades y Significados",
      description: "Cada tipo de paste tiene una historia. El de mole representa la adaptación mexicana; el de papa con carne honra la receta original; el dulce de piña celebra las frutas locales."
    },
    {
      title: "El Paste como Ofrenda",
      description: "Durante el Día de Muertos, los pastes son parte esencial de las ofrendas, especialmente en el Panteón Inglés, donde se colocan pastes junto a las tumbas de los mineros cornish."
    }
  ]
};

// Religious syncretism
const religiousSyncretism = {
  title: "Sincretismo Religioso",
  description: "Real del Monte es un ejemplo único de coexistencia religiosa. Católicos y anglicanos comparten el mismo espacio físico y social, respetando mutuamente sus tradiciones.",
  elements: [
    {
      faith: "Catolicismo",
      practices: ["Procesiones de Semana Santa", "Fiestas patronales", "Día de Muertos tradicional", "Romerías a santuarios"],
      significance: "La religión mayoritaria, practicada desde la época colonial con fuerte arraigo en la comunidad."
    },
    {
      faith: "Anglicanismo",
      practices: ["Servicios en inglés y español", "Navidad anglicana", "Servicios en el Panteón Inglés", "Coros eclesiásticos"],
      significance: "Mantenido por la comunidad cornish y sus descendientes, único en México."
    },
    {
      faith: "Tradiciones Indígenas",
      practices: ["Ofrendas a la tierra", "Respeto a los manantiales", "Curanderismo", "Calendario ceremonial agrícola"],
      significance: "Preservadas por las comunidades otomíes de la región, especialmente en zonas rurales cercanas."
    }
  ]
};

// Cultural images
const culturalImages = [
  { src: callesImg, alt: "Calles durante festival", caption: "Las calles se llenan de color durante las festividades" },
  { src: panteonImg, alt: "Panteón Inglés ceremonial", caption: "Ceremonia bicultural en el Panteón Inglés" },
  { src: heroImg, alt: "Celebración comunitaria", caption: "Celebraciones que unen a toda la comunidad" },
  { src: penasImg, alt: "Tradiciones en la naturaleza", caption: "Tradiciones que honran el entorno natural" },
];

const CulturaPage = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  return (
    <RDMLayout>
      <div ref={containerRef} className="min-h-screen bg-background overflow-x-hidden">
        <SEOMeta {...PAGE_SEO.cultura} />
        
        {/* Hero Section */}
        <div className="relative h-[85vh] min-h-[600px] overflow-hidden">
          <motion.div 
            className="absolute inset-0 -z-10"
            style={{ y: backgroundY }}
          >
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-110"
              style={{ backgroundImage: `url(${callesImg})` }}
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
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary text-sm font-medium mb-6 backdrop-blur-sm"
                >
                  <Palette className="w-4 h-4" />
                  Tradición Viva
                </motion.span>
                
                <TextReveal>
                  <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold text-foreground mb-6 leading-[1.1]">
                    Cultura y{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-gold to-terracotta">
                      Tradiciones
                    </span>
                  </h1>
                </TextReveal>
                
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed"
                >
                  Un mosaico cultural donde las tradiciones mexicanas se entrelazan con las costumbres 
                  cornish, creando una identidad única que se expresa en festivales, música, 
                  gastronomía y el diario vivir.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.6 }}
                  className="flex flex-wrap gap-4 mt-8"
                >
                  <Button size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-full px-8">
                    <Calendar className="w-4 h-4 mr-2" />
                    Calendario de Festivales
                  </Button>
                  <Button variant="outline" size="lg" className="rounded-full px-8 border-2">
                    <Music className="w-4 h-4 mr-2" />
                    Expresiones Culturales
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

        {/* Introduction */}
        <section className="py-20">
          <div className="container mx-auto px-4 md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto text-center"
            >
              <span className="text-terracotta text-sm font-medium uppercase tracking-wider">Identidad</span>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mt-2 mb-6">
                Una Cultura de Encuentro
              </h2>
              <p className="text-muted-foreground leading-relaxed text-lg">
                La cultura de Real del Monte es el resultado de más de 200 años de diálogo entre 
                dos mundos: el mexicano, con sus raíces indígenas y coloniales, y el británico, 
                específicamente de Cornualles. Esta fusión no es una simple suma de elementos, 
                sino la creación de algo completamente nuevo: una cultura híbrida que mantiene 
                vivas sus dos herencias mientras genera expresiones únicas que no existen en 
                ningún otro lugar del mundo.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Festivals Section */}
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-4 md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="text-gold text-sm font-medium uppercase tracking-wider">Festividades</span>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mt-2 mb-4">
                Festivales y Celebraciones
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                El calendario cultural de Real del Monte está marcado por festividades que celebran 
                su herencia única y atraen a visitantes de todo el mundo
              </p>
            </motion.div>

            <Accordion type="single" collapsible className="max-w-4xl mx-auto space-y-4">
              {festivals.map((festival, index) => (
                <AccordionItem key={festival.id} value={festival.id} className="glass rounded-2xl border-0 px-6">
                  <AccordionTrigger className="hover:no-underline py-6">
                    <div className="flex items-center gap-4 text-left">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-terracotta to-gold flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-serif text-xl font-bold text-foreground">{festival.name}</h3>
                        <p className="text-sm text-muted-foreground">{festival.month} • {festival.date}</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6">
                    <div className="pl-16 space-y-4">
                      <p className="text-muted-foreground leading-relaxed">{festival.fullDescription}</p>
                      
                      <div>
                        <h4 className="font-semibold text-foreground mb-2">Actividades principales:</h4>
                        <div className="grid md:grid-cols-2 gap-2">
                          {festival.activities.map((activity, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Star className="w-3 h-3 text-gold" />
                              {activity}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                        <span className="text-sm text-primary">
                          <strong>Significado cultural:</strong> {festival.culturalSignificance}
                        </span>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Cultural Expressions Tabs */}
        <section className="py-24">
          <div className="container mx-auto px-4 md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="text-primary text-sm font-medium uppercase tracking-wider">Expresiones</span>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mt-2 mb-4">
                Arte y Cultura Viva
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Las artes en Real del Monte reflejan su dualidad cultural y su conexión con la tierra
              </p>
            </motion.div>

            <Tabs defaultValue="Música" className="w-full">
              <TabsList className="w-full max-w-2xl mx-auto grid grid-cols-4 mb-12">
                {culturalExpressions.map((expr) => (
                  <TabsTrigger key={expr.category} value={expr.category}>
                    <expr.icon className="w-4 h-4 mr-2" />
                    {expr.category}
                  </TabsTrigger>
                ))}
              </TabsList>

              {culturalExpressions.map((expression) => (
                <TabsContent key={expression.category} value={expression.category}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="grid md:grid-cols-3 gap-6"
                  >
                    {expression.items.map((item, index) => (
                      <GlowCard key={index}>
                        <div className="p-6">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-gold flex items-center justify-center mb-4">
                            <expression.icon className="w-6 h-6 text-white" />
                          </div>
                          <h3 className="font-serif text-xl font-bold text-foreground mb-3">
                            {item.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                            {item.description}
                          </p>
                          <div className="pt-4 border-t border-border">
                            <span className="text-xs text-primary">
                              <strong>Importancia:</strong> {item.significance}
                            </span>
                          </div>
                        </div>
                      </GlowCard>
                    ))}
                  </motion.div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </section>

        {/* Traditions Grid */}
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-4 md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="text-terracotta text-sm font-medium uppercase tracking-wider">Costumbres</span>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mt-2 mb-4">
                Tradiciones que Definen al Pueblo
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Costumbres arraigadas en la vida cotidiana de los realmontenses
              </p>
            </motion.div>

            <StaggerContainer className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {traditions.map((tradition, index) => (
                <StaggerItem key={index}>
                  <motion.div 
                    className="glass rounded-2xl p-6 h-full"
                    whileHover={{ y: -4, boxShadow: "0 20px 40px -15px rgba(0,0,0,0.1)" }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-terracotta to-gold flex items-center justify-center shrink-0">
                        <tradition.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-serif text-lg font-bold text-foreground mb-2">
                          {tradition.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {tradition.description}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>

        {/* Gastronomic Culture */}
        <section className="py-24">
          <div className="container mx-auto px-4 md:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <span className="text-gold text-sm font-medium uppercase tracking-wider">Gastronomía</span>
                <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mt-2 mb-4">
                  {gastronomicCulture.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-8 text-lg">
                  {gastronomicCulture.description}
                </p>

                <Accordion type="single" collapsible className="space-y-3">
                  {gastronomicCulture.aspects.map((aspect, index) => (
                    <AccordionItem key={index} value={`aspect-${index}`} className="border rounded-xl px-4">
                      <AccordionTrigger className="hover:no-underline py-4">
                        <span className="font-semibold text-foreground">{aspect.title}</span>
                      </AccordionTrigger>
                      <AccordionContent className="pb-4">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {aspect.description}
                        </p>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                <ParallaxImage src={callesImg} alt="Cultura del Paste" />
                <div className="absolute -bottom-6 -left-6 bg-background p-6 rounded-2xl shadow-elevated max-w-xs">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center">
                      <Heart className="w-5 h-5 text-gold" />
                    </div>
                    <span className="font-serif font-bold text-foreground">Dato Curioso</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    El paste es el único platillo en México que tiene su propio museo dedicado exclusivamente a él.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Religious Syncretism */}
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-4 md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="text-primary text-sm font-medium uppercase tracking-wider">Espiritualidad</span>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mt-2 mb-4">
                {religiousSyncretism.title}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {religiousSyncretism.description}
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6">
              {religiousSyncretism.elements.map((element, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="glass rounded-2xl p-6"
                >
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-terracotta flex items-center justify-center mb-4">
                    <Church className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-foreground mb-3">
                    {element.faith}
                  </h3>
                  <ul className="space-y-2 mb-4">
                    {element.practices.map((practice, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-1 h-1 rounded-full bg-primary" />
                        {practice}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-muted-foreground/70 pt-4 border-t border-border">
                    {element.significance}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Image Gallery */}
        <section className="py-24">
          <div className="container mx-auto px-4 md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="text-gold text-sm font-medium uppercase tracking-wider">Galería</span>
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mt-2 mb-4">
                Momentos Culturales
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Imágenes que capturan la esencia de las tradiciones de Real del Monte
              </p>
            </motion.div>

            <ImageGallery />
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-terracotta/10" />
          <div className="container mx-auto px-4 md:px-8 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto text-center"
            >
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
                Vive la Cultura de Real del Monte
              </h2>
              <p className="text-muted-foreground mb-8">
                Participa en nuestros festivales, aprende nuestras tradiciones y lleva contigo 
                un pedazo de esta cultura única en el mundo.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-full px-8">
                  <Calendar className="w-4 h-4 mr-2" />
                  Ver Calendario Anual
                </Button>
                <Button variant="outline" size="lg" className="rounded-full px-8 border-2">
                  <Globe className="w-4 h-4 mr-2" />
                  Talleres Culturales
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

      </div>
    </RDMLayout>
  );
};

export default CulturaPage;
