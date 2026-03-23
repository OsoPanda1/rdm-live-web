import type { Intent } from "@/lib/types";

export const REAL_DEL_MONTE_FACTS = {
  heritage: [
    "Mineral del Monte fue incorporado al programa Pueblos Mágicos en 2004 y consolidó una marca turística centrada en patrimonio minero, arquitectura y gastronomía.",
    "La influencia cornish llegó en 1824 con compañías mineras británicas que introdujeron técnicas de extracción, tradiciones gastronómicas y prácticas deportivas.",
    "La Comarca Minera de Hidalgo fue reconocida como Geoparque Mundial UNESCO en 2017, elevando el valor geológico y educativo de la región.",
  ],
  culture: [
    "El Panteón Inglés conserva lápidas orientadas según tradición británica y una narrativa migrante única en México.",
    "El legado del paste evolucionó de alimento funcional para mineros a icono gastronómico hidalguense.",
    "El clima de neblina, las cubiertas a dos aguas y los callejones empedrados construyen una estética romántica de montaña.",
  ],
  romance: [
    "Al caer la tarde, las chimeneas y la neblina convierten al centro histórico en un escenario íntimo para caminatas de pareja.",
    "Los miradores de la sierra permiten atardeceres panorámicos ideales para fotografía y experiencias slow-travel.",
  ],
  sources: [
    "https://es.wikipedia.org/wiki/Mineral_del_Monte",
    "https://www.unesco.org/en/iggp/geoparks/comarca-minera",
    "https://es.wikipedia.org/wiki/Paste_(platillo)",
  ],
} as const;

export const LONG_FORM_NARRATIVES: Record<Intent, string[]> = {
  gastronomia: [
    "Aquí el viaje empieza en el horno: el paste no es solo comida, es memoria obrera. Llegó con los mineros cornish en el siglo XIX y hoy cada pastería protege su receta con orgullo familiar. Caminar por el centro es seguir el aroma de masa dorada, café de olla y canela, entre vitrinas donde la tradición convive con versiones contemporáneas.",
    "En Real del Monte la gastronomía se cuenta como una historia de resistencia: un platillo pensado para jornadas mineras terminó convirtiéndose en identidad regional. Los rellenos clásicos de papa, carne y cebolla comparten calle con propuestas dulces y estacionales, siempre con una promesa: sabor honesto, porción cálida y hospitalidad serrana.",
  ],
  historia: [
    "La historia de Mineral del Monte late bajo tierra. Sus minas conectaron a la región con ciclos económicos globales y dejaron una huella social profunda: innovación técnica, migración británica, organización obrera y patrimonio industrial. Cada visita guiada permite entender cómo la montaña moldeó oficios, barrios y memoria colectiva.",
    "Recorrer sus museos y socavones es mirar la ingeniería y la vida cotidiana de los mineros. Las herramientas, los túneles y la arquitectura de hierro narran siglos de trabajo y adaptación. No es una postal estática: es un territorio vivo que transforma su pasado en aprendizaje turístico y cultural.",
  ],
  aventura: [
    "La sierra ofrece rutas de altitud, bosques húmedos y miradores dramáticos donde la niebla abre y cierra escenarios en minutos. Es ideal para senderismo interpretativo, fotografía de paisaje y travesías cortas de fin de semana con guías locales.",
    "La aventura en Real del Monte no depende de la velocidad, sino del ritmo de la montaña: ascensos moderados, caminos históricos y paradas panorámicas. Entre peñas y bosques, la experiencia combina naturaleza, historia minera y aire frío de altura.",
  ],
  hospedaje: [
    "Dormir aquí es continuar la narrativa del pueblo: hoteles boutique y casas coloniales con chimenea, textiles cálidos y vistas de neblina. El hospedaje funciona como extensión de la experiencia cultural, no como simple logística.",
    "Las noches de montaña invitan al descanso lento: café temprano, recorridos caminables y atmósfera íntima. Es un destino ideal para escapadas de reconexión, tanto en pareja como en formato familiar.",
  ],
  cultura: [
    "Real del Monte mezcla raíz mexicana con herencia británica de forma tangible: arquitectura, cementerio histórico, gastronomía y relatos comunitarios. Esa fusión produce una identidad irrepetible dentro del corredor turístico de Hidalgo.",
    "El visitante encuentra cultura en lo cotidiano: fachadas coloridas, talleres artesanales, festividades, callejones y memoria oral. El destino funciona mejor cuando se vive despacio, conversando con cronistas y productores locales.",
  ],
};

export interface GlobalTourismFeature {
  id: string;
  name: string;
  implemented: boolean;
  description: string;
}

export const GLOBAL_TOURISM_FEATURES: GlobalTourismFeature[] = [
  { id: "f1", name: "Búsqueda semántica", implemented: true, description: "Consulta por intención y contexto en lenguaje natural." },
  { id: "f2", name: "Mapa interactivo", implemented: true, description: "Exploración visual de zonas, POIs y capas temáticas." },
  { id: "f3", name: "Storytelling multimedia", implemented: true, description: "Narrativas visuales por secciones culturales." },
  { id: "f4", name: "Navegación one-page", implemented: true, description: "Transiciones suaves entre verticales turísticas." },
  { id: "f5", name: "Recomendación híbrida IA", implemented: true, description: "Ranking por afinidad, distancia, horario y tendencia." },
  { id: "f6", name: "Segmentación por intención", implemented: true, description: "Rutas para gastronomía, historia, cultura, aventura y hospedaje." },
  { id: "f7", name: "Diseño mobile-first", implemented: true, description: "UI adaptable para viajeros en movimiento." },
  { id: "f8", name: "Panel operativo", implemented: true, description: "Visualización de telemetría y estado del sistema." },
  { id: "f9", name: "SSE en tiempo real", implemented: true, description: "Flujos de decisión con heartbeat y reconexión." },
  { id: "f10", name: "Componentes accesibles", implemented: true, description: "Base UI con primitives enfocadas en accesibilidad." },
  { id: "f11", name: "Itinerarios colaborativos", implemented: false, description: "Guardado y edición compartida de rutas entre viajeros." },
  { id: "f12", name: "Price tracking", implemented: false, description: "Alertas de variación de tarifas de hospedaje y tours." },
  { id: "f13", name: "Comparador inteligente", implemented: false, description: "Comparativa de costos, tiempos y valor cultural." },
  { id: "f14", name: "Reserva integrada", implemented: false, description: "Checkout unificado para actividades y hospedaje." },
  { id: "f15", name: "Reseñas verificadas", implemented: false, description: "Valoración con trazabilidad y anti-fraude." },
  { id: "f16", name: "Rutas offline", implemented: false, description: "Modo sin conexión para mapa e itinerarios." },
  { id: "f17", name: "Audio-guías inmersivas", implemented: false, description: "Narración geolocalizada y activación por proximidad." },
  { id: "f18", name: "Traductor contextual", implemented: false, description: "Asistente multi-idioma en puntos clave del recorrido." },
  { id: "f19", name: "AR patrimonial", implemented: false, description: "Reconstrucción histórica de espacios mineros y urbanos." },
  { id: "f20", name: "Asistente de accesibilidad", implemented: false, description: "Filtros por movilidad reducida y necesidades sensoriales." },
  { id: "f21", name: "Clima hiperlocal", implemented: false, description: "Pronóstico de microzonas para planear actividades." },
  { id: "f22", name: "Detección de saturación", implemented: false, description: "Alertas de aforo para redistribuir visitantes." },
  { id: "f23", name: "Gamificación territorial", implemented: false, description: "Misiones culturales con recompensas locales." },
  { id: "f24", name: "Wallet turístico", implemented: false, description: "Pases, cupones y beneficios por fidelidad." },
  { id: "f25", name: "Recomendación romántica", implemented: true, description: "Sugerencias para atardeceres, cenas y caminatas íntimas." },
  { id: "f26", name: "Métricas de sostenibilidad", implemented: false, description: "Huella de visita y consumo responsable." },
  { id: "f27", name: "Detección de sesgo", implemented: false, description: "Monitoreo de fairness en ranking y exposición de negocios." },
  { id: "f28", name: "Orquestación edge", implemented: false, description: "Respuestas de baja latencia en nodos distribuidos." },
  { id: "f29", name: "Motor de eventos", implemented: true, description: "Registro de interacción cívico-turística para inteligencia operativa." },
  { id: "f30", name: "Checklist producción", implemented: true, description: "Ruta de cierre de módulos con validación pre-deploy." },
];
