import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { 
  MapPin, Clock, Footprints, Mountain, Trees, Camera, 
  Utensils, Beer, History, Compass, Star, ChevronRight, Sparkles,
  Info, CheckCircle2, AlertCircle, Route, Map,
  Thermometer, Backpack, Droplets, Sun, Wind
} from "lucide-react";
import { RDMLayout } from "@/components/rdm/RDMLayout";
import { SEOMeta, PAGE_SEO } from "@/components/SEOMeta";
import { TextReveal, StaggerContainer, StaggerItem, GlowCard } from "@/components/VisualEffects";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

// Assets
import heroImg from "@/assets/hero-real-del-monte.webp";
import minaImg from "@/assets/mina-acosta.webp";
import panteonImg from "@/assets/panteon-ingles.webp";
import penasImg from "@/assets/penas-cargadas.webp";
import callesImg from "@/assets/calles-colonial.webp";
import rdm1 from "@/assets/rdm1.jpeg";
import rdm2 from "@/assets/rdm2.jpeg";
import rdm3 from "@/assets/rdm01.jpg";
import rdm4 from "@/assets/rdm02.jpg";

// Route types definition
interface RouteStop {
  name: string;
  description: string;
  duration: string;
  highlights?: string[];
  tips?: string;
}

interface TouristRoute {
  id: string;
  name: string;
  tagline: string;
  description: string;
  fullDescription: string;
  icon: React.ElementType;
  color: string;
  bgGradient: string;
  duration: string;
  distance: string;
  difficulty: "Fácil" | "Moderada" | "Difícil" | "Desafiante";
  physicalLevel: number; // 1-10
  bestTime: string;
  idealFor: string[];
  whatToBring: string[];
  stops: RouteStop[];
  practicalInfo: {
    startPoint: string;
    endPoint: string;
    restrooms: string[];
    foodStops: string[];
    parking: string;
    guided: boolean;
    price?: string;
  };
  tips: string[];
  warnings?: string[];
}

// Routes data
const touristRoutes: TouristRoute[] = [
  {
    id: "historica",
    name: "Ruta Histórica",
    tagline: "Caminando por 460 años de historia",
    description: "Recorrido por los lugares más emblemáticos que cuentan la historia de Real del Monte, desde su fundación minera hasta la actualidad.",
    fullDescription: "La Ruta Histórica es un viaje en el tiempo que te lleva a través de más de cuatro siglos de historia. Comenzando en la Plaza Principal, donde todo inició en 1560, caminarás por las mismas calles que recorrieron mineros, empresarios ingleses y revolucionarios. Cada edificio, cada callejón y cada plaza tiene una historia que contar. Esta ruta incluye visitas al corazón minero del pueblo, al cementerio anglicano único en México, y a los edificios que albergan la memoria de una época dorada. Es una experiencia imperdible para quienes desean comprender la profunda significación histórica de este Pueblo Mágico.",
    icon: History,
    color: "text-terracotta",
    bgGradient: "from-terracotta/20 to-terracotta/5",
    duration: "3-4 horas",
    distance: "4.5 km",
    difficulty: "Fácil",
    physicalLevel: 3,
    bestTime: "Todo el año, preferentemente en la mañana",
    idealFor: ["Familias", "Adultos mayores", "Estudiantes de historia", "Turistas culturales"],
    whatToBring: ["Calzado cómodo", "Protector solar", "Agua", "Cámara fotográfica", "Dinero en efectivo para entradas"],
    stops: [
      {
        name: "Plaza Principal",
        description: "Corazón histórico del pueblo desde 1560. Aquí se encuentra el Kiosco de la Independencia y la Parroquia de la Asunción, construida en el siglo XVIII.",
        duration: "30 min",
        highlights: ["Arquitectura colonial", "Kiosco histórico", "Jardines centenarios"]
      },
      {
        name: "Museo de Medicina Laboral",
        description: "Antiguo hospital de mineros convertido en museo. Exhibe herramientas médicas del siglo XIX y relata las condiciones de salud de los trabajadores mineros.",
        duration: "45 min",
        highlights: ["Instrumentos médicos antiguos", "Historia de la medicina minera", "Arquitectura hospitalaria colonial"]
      },
      {
        name: "Casa de la Cultura",
        description: "Edificio del siglo XIX que alberga exposiciones de arte, talleres culturales y eventos. Su arquitectura victoriana es notable.",
        duration: "30 min",
        highlights: ["Arquitectura victoriana", "Exposiciones temporales", "Talleres artesanales"]
      },
      {
        name: "Mina de Acosta",
        description: "La mina más profunda y famosa del distrito. Desciende 460 metros bajo tierra en un recorrido que muestra las duras condiciones del trabajo minero.",
        duration: "90 min",
        highlights: ["Túneles históricos", "Museo minero", "Experiencia subterránea"],
        tips: "Llevar chaqueta, la temperatura baja de 15°C"
      },
      {
        name: "Panteón Inglés",
        description: "Cementerio anglicano más alto del mundo a 2,700 msnm. Sus tumbas del siglo XIX cuentan historias de amor, tragedia y esperanza.",
        duration: "45 min",
        highlights: ["Arquitectura funeraria victoriana", "Tumbas históricas", "Vistas panorámicas"]
      }
    ],
    practicalInfo: {
      startPoint: "Plaza Principal (frente al Kiosco)",
      endPoint: "Panteón Inglés",
      restrooms: ["Plaza Principal", "Mina de Acosta", "Casa de la Cultura"],
      foodStops: ["Vendedores en Plaza", "Área de la Mina"],
      parking: "Estacionamiento público en Plaza Principal",
      guided: true,
      price: "$150-200 MXN por persona (con guía)"
    },
    tips: [
      "Contrata un guía certificado en la Oficina de Turismo para obtener información detallada",
      "La Mina de Acosta cierra a las 17:00 hrs, planifica tu visita temprano",
      "El Panteón Inglés es especialmente fotogénico durante la golden hour",
      "Usa calzado antideslizante, algunas calles empedradas pueden resbalar"
    ],
    warnings: [
      "La Mina de Acosta no es accesible para personas con movilidad reducida",
      "No recomendada para personas con claustrofobia"
    ]
  },
  {
    id: "senderismo",
    name: "Ruta de Senderismo",
    tagline: "Entre bosques de niebla y paisajes montañosos",
    description: "Explora los senderos naturales que rodean Real del Monte, descubriendo formaciones rocosas únicas y bosques de oyamel.",
    fullDescription: "La Ruta de Senderismo conecta al visitante con la naturaleza exuberante de la Sierra de Pachuca. A través de senderos bien marcados que atraviesan bosques de oyamel, pino y encino, descubrirás paisajes que parecen sacados de un cuento. El punto culminante son las Peñas Cargadas, formaciones rocosas gigantescas en aparente equilibrio imposible que han sido testigos silenciosos de millones de años. Esta ruta ofrece vistas panorámicas del valle, encuentros con la fauna local y la posibilidad de respirar el aire puro de la montaña. Es una experiencia que renovará tu conexión con la naturaleza.",
    icon: Mountain,
    color: "text-forest",
    bgGradient: "from-forest/20 to-forest/5",
    duration: "4-5 horas",
    distance: "8 km",
    difficulty: "Moderada",
    physicalLevel: 6,
    bestTime: "Marzo a noviembre (evitar lluvias intensas)",
    idealFor: ["Senderistas", "Fotógrafos de naturaleza", "Amantes del ecoturismo", "Grupos de amigos"],
    whatToBring: ["Botas de trekking", "Ropa en capas", "Mochila ligera", "2L de agua", "Snacks energéticos", "Protector solar", "Repelente", "Cámara", "Bastones (opcional)"],
    stops: [
      {
        name: "Mirador La Cruz",
        description: "Punto de inicio con vistas panorámicas de 360° del pueblo y la sierra. Ideal para fotografías de amanecer.",
        duration: "20 min",
        highlights: ["Vista panorámica", "Señalética interpretativa", "Bancas de descanso"]
      },
      {
        name: "Bosque de Oyamel",
        description: "Sendero a través del bosque de Abies religiosa. Durante el invierno, este bosque puede albergar mariposas monarca.",
        duration: "90 min",
        highlights: ["Bosque primario", "Aire puro", "Silencio natural"],
        tips: "Mantén silencio para observar fauna"
      },
      {
        name: "Peñas Cargadas",
        description: "Formaciones rocosas gigantes en equilibrio aparentemente imposible. La vista desde la base es impresionante.",
        duration: "60 min",
        highlights: ["Formaciones geológicas únicas", "Escalada básica", "Vistas espectaculares"]
      },
      {
        name: "Manantial de San Antonio",
        description: "Fuente de agua mineral natural que ha sido utilizada desde tiempos prehispánicos. El agua es potable y refrescante.",
        duration: "30 min",
        highlights: ["Agua natural", "Área de descanso", "Historia prehispánica"]
      },
      {
        name: "Valle del Silencio",
        description: "Pradera rodeada de montañas donde el silencio es absoluto. Perfecto para meditación y conexión con la naturaleza.",
        duration: "40 min",
        highlights: ["Pradera natural", "Observación de aves", "Paz absoluta"]
      }
    ],
    practicalInfo: {
      startPoint: "Mirador La Cruz (acceso por carretera a Pachuca)",
      endPoint: "Valle del Silencio (regreso por sendero circular)",
      restrooms: ["Inicio en Mirador (baños portátiles)"],
      foodStops: ["No hay, llevar provisiones"],
      parking: "Estacionamiento en Mirador La Cruz",
      guided: true,
      price: "$200-300 MXN por persona (con guía especializado)"
    },
    tips: [
      "Salir temprano (7:00-8:00 am) para evitar neblina densa",
      "Informa tu ruta a alguien antes de salir",
      "No te desvíes de los senderos marcados",
      "Lleva suficiente agua, no hay fuentes en el camino",
      "El clima cambia rápido, lleva impermeable"
    ],
    warnings: [
      "No hacer en caso de tormenta eléctrica",
      "Cuidado con resbalones en rocas mojadas",
      "Presencia ocasional de serpientes (no venenosas en general)",
      "La altitud (2,700m) puede afectar a personas no aclimatadas"
    ]
  },
  {
    id: "ecoturistica",
    name: "Ruta Ecoturística",
    tagline: "Conservación y educación ambiental",
    description: "Enfocada en la conservación ambiental, esta ruta incluye visitas a proyectos ecológicos, reforestación y educación sobre la biodiversidad local.",
    fullDescription: "La Ruta Ecoturística es una experiencia educativa y transformadora que te conecta con los esfuerzos de conservación de la Sierra de Pachuca. A través de visitas a viveros comunitarios, proyectos de reforestación y áreas protegidas, comprenderás la importancia de preservar estos ecosistemas únicos. Aprenderás sobre las especies endémicas, la importancia del bosque de oyamel para la captación de agua, y los esfuerzos locales por mantener el equilibrio ecológico. Esta ruta incluye actividades prácticas como plantación de árboles y talleres de identificación de flora y fauna. Es ideal para familias, estudiantes y cualquier persona interesada en el turismo responsable.",
    icon: Trees,
    color: "text-emerald-600",
    bgGradient: "from-emerald-500/20 to-emerald-500/5",
    duration: "5-6 horas",
    distance: "6 km",
    difficulty: "Fácil",
    physicalLevel: 4,
    bestTime: "Temporada de lluvias (junio-septiembre) para reforestación",
    idealFor: ["Familias con niños", "Estudiantes", "Grupos escolares", "Turistas responsables"],
    whatToBring: ["Calzado cómodo", "Ropa que se pueda ensuciar", "Guantes de jardinería", "Agua reutilizable", "Protector solar biodegradable", "Cuaderno de campo"],
    stops: [
      {
        name: "Vivero Comunitario",
        description: "Vivero donde se producen plantas nativas para reforestación. Aprende sobre especies endémicas y sus usos.",
        duration: "60 min",
        highlights: ["Plantas nativas", "Taller de identificación", "Actividad de siembra"]
      },
      {
        name: "Zona de Reforestación",
        description: "Área donde se realizan actividades de plantación de árboles. Los visitantes pueden plantar su propio árbol.",
        duration: "90 min",
        highlights: ["Plantación de árboles", "Compromiso ambiental", "Certificado de participación"],
        tips: "Se proporcionan herramientas y plantas"
      },
      {
        name: "Sendero de Interpretación Ambiental",
        description: "Sendero con señalética sobre la flora, fauna y geología locales. Incluye estaciones de observación.",
        duration: "75 min",
        highlights: ["Señalética educativa", "Observación de aves", "Identificación de plantas"]
      },
      {
        name: "Centro de Educación Ambiental",
        description: "Espacio con exhibiciones interactivas sobre la biodiversidad de la sierra y los retos de conservación.",
        duration: "45 min",
        highlights: ["Exhibiciones interactivas", "Documentales", "Biblioteca ambiental"]
      },
      {
        name: "Mirador de Aves",
        description: "Punto de observación de aves con guías especializados. Se han registrado más de 80 especies.",
        duration: "60 min",
        highlights: ["Observación de aves", "Prismáticos disponibles", "Guía de aves local"]
      }
    ],
    practicalInfo: {
      startPoint: "Centro de Educación Ambiental (carretera a Huasca)",
      endPoint: "Mismo punto de inicio (ruta circular)",
      restrooms: ["Centro de Educación Ambiental", "Vivero Comunitario"],
      foodStops: ["Área de picnic (llevar comida)"],
      parking: "Estacionamiento en Centro de Educación Ambiental",
      guided: true,
      price: "$250-350 MXN por persona (incluye material y árbol)"
    },
    tips: [
      "Reserva con anticipación, los grupos son pequeños",
      "Puedes regresar a visitar tu árbol plantado",
      "Lleva binoculares si tienes",
      "Viste colores neutros para observación de fauna"
    ]
  },
  {
    id: "aventura",
    name: "Ruta de Aventura",
    tagline: "Adrenalina en la montaña",
    description: "Para los amantes de la emoción: tirolesa, rappel, escalada en roca y más actividades extremas en el entorno natural.",
    fullDescription: "La Ruta de Aventura está diseñada para quienes buscan emociones fuertes y experiencias que ponen a prueba sus límites. En el impresionante escenario de las Peñas Cargadas y sus alrededores, podrás practicar escalada en roca natural, descender por acantilados con rappel, volar sobre el bosque en tirolesa, y explorar cañones. Todas las actividades son supervisadas por instructores certificados y cuentan con equipo de seguridad profesional. No se requiere experiencia previa para la mayoría de las actividades, solo actitud aventurera y ganas de superación. Es una manera única de experimentar la geografía de Real del Monte desde perspectivas que pocos llegan a ver.",
    icon: Compass,
    color: "text-orange-600",
    bgGradient: "from-orange-500/20 to-orange-500/5",
    duration: "6-8 horas",
    distance: "5 km (varía por actividades)",
    difficulty: "Desafiante",
    physicalLevel: 8,
    bestTime: "Marzo a junio (clima estable)",
    idealFor: ["Aventureros", "Grupos de amigos", "Team building", "Deportistas"],
    whatToBring: ["Ropa deportiva ajustada", "Tenis con buen grip", "Guantes (opcional)", "2L de agua", "Snacks", "Cámara de acción", "Repelente"],
    stops: [
      {
        name: "Base de Operaciones",
        description: "Punto de reunión donde se da la inducción de seguridad y se entrega el equipo necesario.",
        duration: "45 min",
        highlights: ["Inducción de seguridad", "Entrega de equipo", "Calentamiento"]
      },
      {
        name: "Tirolesa del Águila",
        description: "Vuelo de 400 metros sobre el bosque a 80 metros de altura. Sensación única de libertad.",
        duration: "60 min",
        highlights: ["400m de vuelo", "80m de altura", "Vistas panorámicas"],
        tips: "No llevar objetos sueltos en bolsillos"
      },
      {
        name: "Paredón de Escalada",
        description: "Rutas de escalada en roca natural de diferentes grados de dificultad (5.5 a 5.10).",
        duration: "120 min",
        highlights: ["Escalada en roca natural", "Diferentes niveles", "Instructores certificados"]
      },
      {
        name: "Rappel en Peñas Cargadas",
        description: "Descenso controlado de 30 metros por la pared de las Peñas Cargadas. Experiencia vertiginosa.",
        duration: "90 min",
        highlights: ["Descenso de 30m", "Técnica de rappel", "Adrenalina pura"]
      },
      {
        name: "Cañonismo Básico",
        description: "Recorrido por un cañón secuencial con saltos controlados a pozas de agua (en temporada).",
        duration: "90 min",
        highlights: ["Saltos a pozas", "Nado", "Trekking acuático"]
      }
    ],
    practicalInfo: {
      startPoint: "Base de Operaciones Aventura (Peñas Cargadas)",
      endPoint: "Mismo punto de inicio",
      restrooms: ["Base de Operaciones"],
      foodStops: ["Área de comida en Base de Operaciones"],
      parking: "Estacionamiento en Base de Operaciones",
      guided: true,
      price: "$800-1,200 MXN por persona (todo incluido)"
    },
    tips: [
      "Reserva con al menos una semana de anticipación",
      "No consumir alcohol antes de las actividades",
      "Informa sobre condiciones médicas relevantes",
      "Sigue SIEMPRE las instrucciones de los guías",
      "Puedes contratar paquete fotográfico"
    ],
    warnings: [
      "No apto para personas con problemas cardíacos",
      "No apto para mujeres embarazadas",
      "No apto para personas con miedo intenso a las alturas",
      "Requiere firma de liberación de responsabilidad",
      "Actividades sujetas a condiciones climáticas"
    ]
  },
  {
    id: "gastronomica",
    name: "Ruta Gastronómica",
    tagline: "Un viaje de sabores tradicionales",
    description: "Recorrido por las tradiciones culinarias de Real del Monte, degustando pastes, dulces típicos y platillos de la cocina minera.",
    fullDescription: "La Ruta Gastronómica es un festín para los sentidos que te lleva a través de los sabores que definieron a Real del Monte. Desde el icónico paste hasta los guisos mineros que sustentaron generaciones de trabajadores, cada parada es una lección de historia y cultura. Visitaremos pastelerías tradicionales donde se guardan secretos familiares transmitidos por generaciones, probaremos dulces que datan de la época colonial, y degustaremos bebidas que han refrescado a mineros desde el siglo XIX. Esta ruta no es solo para comer: es para comprender cómo la gastronomía refleja la fusión cultural única de este Pueblo Mágico. Los grupos son reducidos para garantizar una experiencia íntima y personalizada.",
    icon: Utensils,
    color: "text-gold",
    bgGradient: "from-gold/20 to-gold/5",
    duration: "4-5 horas",
    distance: "3 km (caminata muy ligera)",
    difficulty: "Fácil",
    physicalLevel: 2,
    bestTime: "Todo el año, especialmente octubre (Festival del Paste)",
    idealFor: ["Foodies", "Familias", "Grupos de amigos", "Turistas culturales"],
    whatToBring: ["Ropa cómoda", "Hambre", "Botella de agua", "Dinero en efectivo", "Cámara"],
    stops: [
      {
        name: "Desayuno Tradicional",
        description: "Iniciamos con un desayuno de campeones: huevos al gusto, frijoles, café de altura y pan recién hecho en una auténtica cocina local.",
        duration: "45 min",
        highlights: ["Café de la región", "Pan artesanal", "Huevos rancheros"]
      },
      {
        name: "Taller de Paste",
        description: "Aprende a hacer tu propio paste con una familia pastelesa tradicional. Te llevas lo que prepares.",
        duration: "90 min",
        highlights: ["Receta tradicional", "Masa desde cero", "Llevas tu paste"],
        tips: "Reservar con anticipación, cupo limitado"
      },
      {
        name: "Recorrido de Pastelerías",
        description: "Visita a 3 pastelerías icónicas para degustar diferentes variedades: tradicional, de mole y dulce.",
        duration: "60 min",
        highlights: ["Degustación guiada", "Historias familiares", "Técnica de elaboración"]
      },
      {
        name: "Museo del Paste",
        description: "Visita al único museo dedicado al paste en México. Historia, utensilios antiguos y cultura pastelesa.",
        duration: "45 min",
        highlights: ["Historia del paste", "Utensilios antiguos", "Galería fotográfica"]
      },
      {
        name: "Comida Minera",
        description: "Almuerzo completo con guiso de res minero, truchas o barbacoa estilo Hidalgo, acompañado de aguas frescas.",
        duration: "75 min",
        highlights: ["Guiso tradicional", "Recetas antiguas", "Ambiente histórico"]
      },
      {
        name: "Dulces y Postres",
        description: "Finalizamos con una degustación de dulces típicos: obleas de gajeta, jamoncillo, cocada y ate.",
        duration: "30 min",
        highlights: ["Dulces coloniales", "Recetas tradicionales", "Para llevar"]
      }
    ],
    practicalInfo: {
      startPoint: "Plaza Principal (frente a la Parroquia)",
      endPoint: "Portal del Comercio",
      restrooms: ["En cada parada gastronómica"],
      foodStops: ["Todas las paradas incluyen degustación"],
      parking: "Estacionamiento en Plaza Principal",
      guided: true,
      price: "$600-800 MXN por persona (todas las degustaciones incluidas)"
    },
    tips: [
      "Ven con hambre, son muchas degustaciones",
      "Avisa sobre alergias alimentarias al reservar",
      "Puedes comprar productos para llevar en cada parada",
      "Lleva bolsa térmica si planeas comprar pastes",
      "La ruta puede adaptarse para vegetarianos"
    ]
  },
  {
    id: "cervecera",
    name: "Ruta Cervecera",
    tagline: "Tradición cervecera cornish-mexicana",
    description: "Descubre la tradición cervecera traída por los ingleses, visita cervecerías artesanales y degusta cervezas inspiradas en la historia local.",
    fullDescription: "La Ruta Cervecera revela una faceta poco conocida de la historia de Real del Monte: la tradición cervecera traída por los mineros cornish. Los ingleses no solo trajeron técnicas mineras, también establecieron las primeras cervecerías de la región para abastecer a la comunidad expatriada. Hoy, esta tradición revive a través de cervecerías artesanales que honran esa herencia con recetas innovadoras inspiradas en ingredientes locales. En esta ruta visitarás cervecerías artesanales, aprenderás sobre el proceso de elaboración, degustarás estilos que van desde ales inglesas tradicionales hasta cervezas con toques de frutas locales y especias. Incluye maridajes especializados y la historia de cómo la cerveza se convirtió en parte de la cultura local.",
    icon: Beer,
    color: "text-amber-600",
    bgGradient: "from-amber-500/20 to-amber-500/5",
    duration: "4 horas",
    distance: "2 km",
    difficulty: "Fácil",
    physicalLevel: 2,
    bestTime: "Todo el año, fines de semana ideales",
    idealFor: ["Amantes de la cerveza artesanal", "Adultos", "Grupos de amigos", "Parejas"],
    whatToBring: ["Identificación oficial", "Ropa cómoda", "Dinero para compras", "Transporte designado o taxi"],
    stops: [
      {
        name: "Cervecería La Mina",
        description: "Cervecería artesanal con temática minera. Aquí se elabora la 'Stout del Minero', inspirada en las porters inglesas tradicionales.",
        duration: "60 min",
        highlights: ["Tour de elaboración", "Degustación de 3 cervezas", "Historia cervecera local"]
      },
      {
        name: "Cervecería del Bosque",
        description: "Ubicada en un entorno natural, especializada en cervezas con ingredientes locales como pino, manzanilla y miel.",
        duration: "60 min",
        highlights: ["Cervezas botánicas", "Ingredientes locales", "Terraza con vistas"]
      },
      {
        name: "Cervecería Cornish Pride",
        description: "Fiel a las raíces inglesas, elabora bitters, pale ales y stouts tradicionales con recetas auténticas.",
        duration: "60 min",
        highlights: ["Recetas auténticas inglesas", "Historia de la cerveza en Real del Monte", "Maridaje con paste"]
      },
      {
        name: "Cervecería 2700",
        description: "Nombrada por la altitud del pueblo. Especializada en IPAs y cervezas de alta graduación con carácter montañés.",
        duration: "60 min",
        highlights: ["IPAs artesanales", "Cervezas de temporada", "Venta de growlers"]
      }
    ],
    practicalInfo: {
      startPoint: "Cervecería La Mina (centro del pueblo)",
      endPoint: "Cervecería 2700",
      restrooms: ["En cada cervecería"],
      foodStops: ["Maridajes incluidos en cada parada"],
      parking: "Varios puntos de estacionamiento en el centro",
      guided: true,
      price: "$500-700 MXN por persona (degustaciones incluidas)"
    },
    tips: [
      "Solo para mayores de 18 años con identificación",
      "Hidrátate entre cervezas",
      "No manejes después del tour, usa transporte alternativo",
      "Pregunta por ediciones limitadas",
      "Puedes comprar cerveza para llevar"
    ],
    warnings: [
      "Consumo responsable obligatorio",
      "No apto para menores de edad",
      "No apto para mujeres embarazadas",
      "No consumir alcohol si tomarás el volante"
    ]
  }
];

const RouteCard = ({ route, isSelected, onClick }: { route: TouristRoute; isSelected: boolean; onClick: () => void }) => {
  const Icon = route.icon;
  
  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`cursor-pointer rounded-2xl p-6 transition-all duration-300 ${
        isSelected 
          ? `bg-gradient-to-br ${route.bgGradient} border-2 border-${route.color.split('-')[1]}` 
          : 'bg-background border border-border hover:border-muted-foreground/30'
      }`}
    >
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-xl ${route.color.replace('text-', 'bg-')}/10 flex items-center justify-center shrink-0`}>
          <Icon className={`w-6 h-6 ${route.color}`} />
        </div>
        <div className="flex-1">
          <h3 className="font-serif text-lg font-bold text-foreground">{route.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{route.tagline}</p>
          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {route.duration}
            </span>
            <span className="flex items-center gap-1">
              <Footprints className="w-3 h-3" />
              {route.distance}
            </span>
            <Badge variant={route.difficulty === "Fácil" ? "secondary" : route.difficulty === "Moderada" ? "default" : "destructive"} className="text-xs">
              {route.difficulty}
            </Badge>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const RouteDetail = ({ route }: { route: TouristRoute }) => {
  const Icon = route.icon;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className={`rounded-2xl p-8 bg-gradient-to-br ${route.bgGradient}`}>
        <div className="flex items-start gap-4 mb-6">
          <div className={`w-16 h-16 rounded-2xl ${route.color.replace('text-', 'bg-')}/20 flex items-center justify-center`}>
            <Icon className={`w-8 h-8 ${route.color}`} />
          </div>
          <div>
            <h2 className="font-serif text-3xl font-bold text-foreground">{route.name}</h2>
            <p className={`${route.color} font-medium`}>{route.tagline}</p>
          </div>
        </div>
        
        <p className="text-muted-foreground leading-relaxed mb-6">{route.fullDescription}</p>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-background/50 rounded-xl p-4 text-center">
            <Clock className={`w-5 h-5 ${route.color} mx-auto mb-2`} />
            <div className="text-sm font-medium text-foreground">{route.duration}</div>
            <div className="text-xs text-muted-foreground">Duración</div>
          </div>
          <div className="bg-background/50 rounded-xl p-4 text-center">
            <Route className={`w-5 h-5 ${route.color} mx-auto mb-2`} />
            <div className="text-sm font-medium text-foreground">{route.distance}</div>
            <div className="text-xs text-muted-foreground">Distancia</div>
          </div>
          <div className="bg-background/50 rounded-xl p-4 text-center">
            <AlertCircle className={`w-5 h-5 ${route.color} mx-auto mb-2`} />
            <div className="text-sm font-medium text-foreground">{route.difficulty}</div>
            <div className="text-xs text-muted-foreground">Dificultad</div>
          </div>
          <div className="bg-background/50 rounded-xl p-4 text-center">
            <Sun className={`w-5 h-5 ${route.color} mx-auto mb-2`} />
            <div className="text-sm font-medium text-foreground">{route.bestTime.split(',')[0]}</div>
            <div className="text-xs text-muted-foreground">Mejor época</div>
          </div>
        </div>
      </div>

      {/* Physical Level */}
      <div className="bg-muted/30 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">Nivel físico requerido</span>
          <span className={`text-sm font-bold ${route.color}`}>{route.physicalLevel}/10</span>
        </div>
        <Progress value={route.physicalLevel * 10} className="h-2" />
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>Relajado</span>
          <span>Intenso</span>
        </div>
      </div>

      {/* Tabs for different sections */}
      <Tabs defaultValue="stops" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="stops">Paradas</TabsTrigger>
          <TabsTrigger value="info">Info Práctica</TabsTrigger>
          <TabsTrigger value="ideal">Ideal Para</TabsTrigger>
          <TabsTrigger value="tips">Consejos</TabsTrigger>
        </TabsList>

        {/* Stops Tab */}
        <TabsContent value="stops" className="space-y-4">
          <h3 className="font-serif text-xl font-bold text-foreground mb-4">Itinerario de Paradas</h3>
          {route.stops.map((stop, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex gap-4 p-4 rounded-xl bg-muted/30"
            >
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 rounded-full ${route.color.replace('text-', 'bg-')}/20 flex items-center justify-center text-sm font-bold ${route.color}`}>
                  {index + 1}
                </div>
                {index < route.stops.length - 1 && (
                  <div className="w-0.5 flex-1 bg-border my-2" />
                )}
              </div>
              <div className="flex-1 pb-6">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-foreground">{stop.name}</h4>
                  <span className="text-xs text-muted-foreground">({stop.duration})</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{stop.description}</p>
                {stop.highlights && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {stop.highlights.map((highlight, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        <Star className="w-3 h-3 mr-1" />
                        {highlight}
                      </Badge>
                    ))}
                  </div>
                )}
                {stop.tips && (
                  <p className="text-xs text-amber-600">
                    <Info className="w-3 h-3 inline mr-1" />
                    {stop.tips}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </TabsContent>

        {/* Practical Info Tab */}
        <TabsContent value="info" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-muted/30">
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Ubicación
              </h4>
              <div className="space-y-2 text-sm">
                <p><strong>Inicio:</strong> {route.practicalInfo.startPoint}</p>
                <p><strong>Fin:</strong> {route.practicalInfo.endPoint}</p>
                <p><strong>Estacionamiento:</strong> {route.practicalInfo.parking}</p>
              </div>
            </div>
            
            <div className="p-4 rounded-xl bg-muted/30">
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Backpack className="w-4 h-4" />
                Servicios
              </h4>
              <div className="space-y-2 text-sm">
                <p><strong>Servicios sanitarios:</strong> {route.practicalInfo.restrooms.join(", ")}</p>
                <p><strong>Comida/Bebida:</strong> {route.practicalInfo.foodStops.join(", ")}</p>
                <p><strong>Guía:</strong> {route.practicalInfo.guided ? "Requerido/Incluido" : "Opcional"}</p>
              </div>
            </div>
          </div>

          {route.practicalInfo.price && (
            <div className="p-4 rounded-xl bg-gold/10 border border-gold/20">
              <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <span className="text-gold">$</span>
                Costo Aproximado
              </h4>
              <p className="text-sm text-muted-foreground">{route.practicalInfo.price}</p>
            </div>
          )}
        </TabsContent>

        {/* Ideal For Tab */}
        <TabsContent value="ideal" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-foreground mb-3">Ideal para:</h4>
              <ul className="space-y-2">
                {route.idealFor.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-3">Qué llevar:</h4>
              <ul className="space-y-2">
                {route.whatToBring.map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Backpack className="w-4 h-4 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </TabsContent>

        {/* Tips Tab */}
        <TabsContent value="tips" className="space-y-4">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-gold" />
                Consejos útiles
              </h4>
              <ul className="space-y-2">
                {route.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <ChevronRight className="w-4 h-4 text-gold shrink-0 mt-0.5" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            {route.warnings && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                <h4 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Advertencias importantes
                </h4>
                <ul className="space-y-2">
                  {route.warnings.map((warning, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-red-600">
                      <span className="text-red-400">•</span>
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* CTA */}
      <div className="flex flex-wrap gap-4">
        <Button className={`${route.color.replace('text-', 'bg-')} text-white rounded-full px-8`}>
          Reservar esta Ruta
        </Button>
        <Button variant="outline" className="rounded-full px-8">
          <Map className="w-4 h-4 mr-2" />
          Descargar Mapa
        </Button>
      </div>
    </motion.div>
  );
};

const RutasPage = () => {
  const [selectedRoute, setSelectedRoute] = useState<TouristRoute>(touristRoutes[0]);
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  return (
    <RDMLayout>
      <div ref={containerRef} className="min-h-screen bg-background overflow-x-hidden">
        <SEOMeta {...PAGE_SEO.rutas} />
        
        {/* Hero Section */}
        <div className="relative h-[70vh] min-h-[500px] overflow-hidden">
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
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary text-sm font-medium mb-6 backdrop-blur-sm"
                >
                  <Route className="w-4 h-4" />
                  Descubre Real del Monte
                </motion.span>
                
                <TextReveal>
                  <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold text-foreground mb-6 leading-[1.1]">
                    Rutas{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-gold to-terracotta">
                      Turísticas
                    </span>
                  </h1>
                </TextReveal>
                
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed"
                >
                  Seis experiencias únicas diseñadas para que descubras Real del Monte desde 
                  diferentes perspectivas: historia, naturaleza, gastronomía y aventura.
                </motion.p>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Routes Section */}
        <section className="py-16">
          <div className="container mx-auto px-4 md:px-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Route Selector */}
              <div className="lg:col-span-1 space-y-4">
                <h2 className="font-serif text-2xl font-bold text-foreground mb-6">Selecciona tu Ruta</h2>
                <div className="space-y-3">
                  {touristRoutes.map((route) => (
                    <RouteCard
                      key={route.id}
                      route={route}
                      isSelected={selectedRoute.id === route.id}
                      onClick={() => setSelectedRoute(route)}
                    />
                  ))}
                </div>
              </div>

              {/* Route Detail */}
              <div className="lg:col-span-2">
                <RouteDetail route={selectedRoute} />
              </div>
            </div>
          </div>
        </section>

        {/* Summary Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="font-serif text-3xl font-bold text-foreground mb-4">
                Resumen de Rutas
              </h2>
              <p className="text-muted-foreground">
                Compara las rutas y elige la que mejor se adapte a tus intereses
              </p>
            </motion.div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-4 px-4 font-semibold text-foreground">Ruta</th>
                    <th className="text-center py-4 px-4 font-semibold text-foreground">Duración</th>
                    <th className="text-center py-4 px-4 font-semibold text-foreground">Distancia</th>
                    <th className="text-center py-4 px-4 font-semibold text-foreground">Dificultad</th>
                    <th className="text-center py-4 px-4 font-semibold text-foreground">Ideal Para</th>
                  </tr>
                </thead>
                <tbody>
                  {touristRoutes.map((route, index) => (
                    <tr key={route.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <route.icon className={`w-5 h-5 ${route.color}`} />
                          <div>
                            <div className="font-medium text-foreground">{route.name}</div>
                            <div className="text-xs text-muted-foreground">{route.tagline}</div>
                          </div>
                        </div>
                      </td>
                      <td className="text-center py-4 px-4 text-muted-foreground">{route.duration}</td>
                      <td className="text-center py-4 px-4 text-muted-foreground">{route.distance}</td>
                      <td className="text-center py-4 px-4">
                        <Badge variant={route.difficulty === "Fácil" ? "secondary" : route.difficulty === "Moderada" ? "default" : "destructive"}>
                          {route.difficulty}
                        </Badge>
                      </td>
                      <td className="text-center py-4 px-4">
                        <div className="flex flex-wrap justify-center gap-1">
                          {route.idealFor.slice(0, 2).map((item, i) => (
                            <span key={i} className="text-xs px-2 py-1 bg-muted rounded-full">
                              {item}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-gold/10" />
          <div className="container mx-auto px-4 md:px-8 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto text-center"
            >
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
                ¿Listo para Explorar?
              </h2>
              <p className="text-muted-foreground mb-8">
                Todas nuestras rutas incluyen guías certificados, seguro de viajero y 
                la garantía de una experiencia auténtica en Real del Monte.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white rounded-full px-8">
                  <Route className="w-4 h-4 mr-2" />
                  Reservar una Ruta
                </Button>
                <Button variant="outline" size="lg" className="rounded-full px-8 border-2">
                  <Map className="w-4 h-4 mr-2" />
                  Descargar Guía Completa
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

      </div>
    </RDMLayout>
  );
};

export default RutasPage;
