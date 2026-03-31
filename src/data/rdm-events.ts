/**
 * Calendario de Eventos y Festivales de Real del Monte
 * Datos basados en investigación web actualizada
 */

export interface RDMEvent {
  id: string;
  name: string;
  date: string;
  dateRange?: string;
  time: string;
  location: string;
  description: string;
  category: "gastronomia" | "cultural" | "deportivo" | "festividad" | "religioso" | "naturaleza";
  image: string;
  destacado?: boolean;
  precio?: string;
}

export const EVENTOS_RDM: RDMEvent[] = [
  {
    id: "EVT-01", name: "Festival Internacional del Paste", date: "Octubre",
    dateRange: "2ª semana de octubre", time: "10:00 – 20:00", location: "Plaza Principal y calles del centro",
    description: "El evento gastronómico más importante de Real del Monte. Más de 50 variedades de pastes, concursos culinarios, música en vivo y el horneo del paste más grande del mundo. Atrae miles de visitantes cada año.",
    category: "gastronomia", image: "rdm-festival-paste", destacado: true, precio: "Entrada libre"
  },
  {
    id: "EVT-02", name: "Día de Muertos Anglo-Mexicano", date: "1-2 Nov",
    time: "18:00 – 23:00", location: "Panteón Inglés y Centro Histórico",
    description: "Celebración única que fusiona las tradiciones mexicanas del Día de Muertos con costumbres anglicanas del Panteón Inglés. Altares, ofrendas bilingües, recorridos nocturnos con velas y narraciones de leyendas mineras.",
    category: "cultural", image: "rdm-dia-muertos", destacado: true, precio: "Entrada libre"
  },
  {
    id: "EVT-03", name: "Feria Patronal de la Asunción", date: "15 Agosto",
    dateRange: "10-16 de agosto", time: "Todo el día", location: "Parroquia y Plaza Principal",
    description: "La fiesta religiosa más importante del pueblo. Procesiones, juegos pirotécnicos, feria popular con juegos mecánicos, antojitos mexicanos y baile popular.",
    category: "religioso", image: "rdm-plaza-principal", precio: "Entrada libre"
  },
  {
    id: "EVT-04", name: "Tianguis de Pueblos Mágicos", date: "Marzo",
    time: "09:00 – 19:00", location: "Centro de Real del Monte",
    description: "Real del Monte alberga el Tianguis Nacional de Pueblos Mágicos con stands de todo México, conferencias sobre turismo sostenible y muestras gastronómicas regionales.",
    category: "cultural", image: "rdm-calles-coloridas", destacado: true, precio: "Entrada libre"
  },
  {
    id: "EVT-05", name: "Carrera de Montaña Sierra de Pachuca", date: "Noviembre",
    time: "07:00 – 14:00", location: "Peñas Cargadas – Bosque El Hiloche",
    description: "Trail running por senderos de bosque de oyamel y formaciones rocosas. Categorías de 10K y 21K con desniveles de hasta 800m.",
    category: "deportivo", image: "rdm-penas-cargadas", precio: "$350-$500 MXN"
  },
  {
    id: "EVT-06", name: "Noche de Leyendas Mineras", date: "Sábados seleccionados",
    time: "20:00 – 23:00", location: "Centro Histórico",
    description: "Recorrido nocturno teatralizado por los callejones narrando leyendas del pueblo: el minero fantasma, la dama de blanco, el tesoro escondido de los cornish. Guías caracterizados recrean las historias.",
    category: "cultural", image: "rdm-callejon-romantico", precio: "$150 MXN"
  },
  {
    id: "EVT-07", name: "Feria del Libro en la Montaña", date: "Diciembre",
    time: "09:00 – 18:00", location: "Casa de Cultura / Centro Cultural",
    description: "Encuentro literario con autores locales y nacionales. Presentaciones de libros, talleres de escritura creativa y cuentacuentos para niños.",
    category: "cultural", image: "rdm-casa-inglesa", precio: "Entrada libre"
  },
  {
    id: "EVT-08", name: "Festival de la Niebla", date: "Julio-Agosto",
    time: "Variable", location: "Miradores y bosques",
    description: "Temporada especial que celebra el fenómeno natural más icónico del pueblo. Fotografía, meditación en el bosque, caminatas guiadas al amanecer y talleres de pintura al aire libre.",
    category: "naturaleza", image: "rdm-bosque-niebla", precio: "Variable"
  },
  {
    id: "EVT-09", name: "Torneo de Fútbol Histórico Cornish", date: "Mayo",
    time: "10:00 – 18:00", location: "Campo deportivo municipal",
    description: "Conmemoración del primer partido de fútbol en México (1900). Torneo recreativo con uniformes de época, conferencias sobre la historia del deporte y exhibición de memorabilia.",
    category: "deportivo", image: "rdm-plaza-principal", precio: "Entrada libre"
  },
  {
    id: "EVT-10", name: "Exposición de Artesanías de Plata", date: "Diciembre",
    dateRange: "Todo diciembre", time: "10:00 – 19:00", location: "Portal del Comercio",
    description: "Los mejores artesanos plateros de la región exhiben y venden piezas únicas. Talleres donde aprendes técnicas básicas de platería con maestros artesanos.",
    category: "cultural", image: "rdm-artesanias-plata", precio: "Entrada libre"
  },
  {
    id: "EVT-11", name: "Año Nuevo en la Montaña", date: "31 Dic",
    time: "21:00 – 02:00", location: "Plaza Principal",
    description: "Celebración comunitaria de fin de año con música en vivo, fuegos artificiales, chocolate caliente y countdown colectivo a 2,700 metros de altura.",
    category: "festividad", image: "rdm-mirador-sunset", precio: "Entrada libre"
  },
  {
    id: "EVT-12", name: "Jornada de Observación de Aves", date: "Abril",
    time: "06:00 – 12:00", location: "Bosque El Hiloche",
    description: "Caminata guiada por biólogos para observar aves endémicas y migratorias en el bosque de niebla. Se proporcionan binoculares y guías ilustradas.",
    category: "naturaleza", image: "rdm-bosque-niebla", precio: "$200 MXN"
  },
];

export const EVENT_CATEGORIES = [
  { value: "all", label: "Todos", emoji: "🎪" },
  { value: "gastronomia", label: "Gastronomía", emoji: "🍽️" },
  { value: "cultural", label: "Cultural", emoji: "🎭" },
  { value: "deportivo", label: "Deportivo", emoji: "🏃" },
  { value: "festividad", label: "Festividad", emoji: "🎆" },
  { value: "religioso", label: "Religioso", emoji: "⛪" },
  { value: "naturaleza", label: "Naturaleza", emoji: "🌲" },
];

/** Datos curiosos y razones para visitar */
export const DATOS_CURIOSOS = [
  "Aquí se jugó el primer partido de fútbol en México (1900)",
  "El Panteón Inglés es el cementerio anglicano más alto del mundo (2,700 msnm)",
  "Los pastes fueron traídos por mineros de Cornualles, Inglaterra en el siglo XIX",
  "Real del Monte financió la Independencia de México con su plata",
  "La primera máquina de vapor de América Latina se instaló aquí en 1827",
  "Tiene más de 500 km de túneles subterráneos históricos",
  "La neblina cubre el pueblo más de 180 días al año",
  "Es el único sitio en América dentro del Patrimonio Minero Mundial de Cornualles",
  "El paste más grande del mundo se hornea aquí cada año durante el festival",
  "Real del Monte fue nombrado Pueblo Mágico en 2004",
];

/** Sabías que... secciones para esparcir por la plataforma */
export const SABIAS_QUE = [
  { titulo: "Cuna del Fútbol Mexicano", texto: "En 1900, los mineros ingleses jugaron aquí el primer partido de fútbol documentado en México, introduciendo el deporte que hoy es pasión nacional." },
  { titulo: "Plata que Hizo Naciones", texto: "La plata extraída de estas minas financió la Corona Española, la Independencia de México y el desarrollo de infraestructura en tres continentes." },
  { titulo: "El Paste: Fusión Binacional", texto: "El Cornish Pasty inglés se transformó en el paste mexicano al incorporar ingredientes como mole, frijol, tinga y rajas con queso." },
  { titulo: "Patrimonio Mundial", texto: "Real del Monte es el único sitio fuera de Gran Bretaña incluido en el Patrimonio Mundial Minero de Cornualles (UNESCO)." },
  { titulo: "Bosque de Niebla", texto: "El bosque que rodea al pueblo alberga más de 850 especies de flora documentadas, incluyendo orquídeas endémicas únicas." },
];
