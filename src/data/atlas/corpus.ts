// ─────────────────────────────────────────────────────────────────────────────
// CORPUS MAXIMUS · Real del Monte · Ingesta Nivel 0 (Público/Turístico)
// Fuente de verdad para ISABELLA AI v4.0 / Realito AI
// Estructurado para render visual + inyección en system prompt del chat.
// ─────────────────────────────────────────────────────────────────────────────

export type CorpusSectionId =
  | "historia"
  | "cultura"
  | "gastronomia"
  | "museos"
  | "ecoturismo"
  | "eventos";

export interface CorpusEntry {
  id: string;
  title: string;
  era?: string;
  body: string;
  highlights?: string[];
  coords?: { lat: number; lng: number };
}

export interface CorpusSection {
  id: CorpusSectionId;
  label: string;
  glyph: string;
  accent: "gold" | "electric" | "terracotta" | "forest" | "copper";
  tagline: string;
  entries: CorpusEntry[];
}

export const RDM_CORPUS: CorpusSection[] = [
  {
    id: "historia",
    label: "Historia Minera Profunda",
    glyph: "🏛️",
    accent: "gold",
    tagline: "El legado de la tierra · biografía del subsuelo mexicano",
    entries: [
      {
        id: "prehispanica-virreinal",
        title: "Época Prehispánica y Era Virreinal",
        era: "Pre-1552 → 1766",
        body: "Antes de la llegada de los europeos, la región era conocida como Magotsi (del otomí 'Paso Alto' o 'Puerto Alto'). Tras la caída de Tenochtitlán, en 1552 se descubrieron las primeras vetas de plata. La extracción temprana se realizaba mediante el sistema de 'ratoneras', túneles estrechos e irregulares. Pedro Romero de Terreros, el Conde de Regla, consolidó un imperio minero que financió gran parte de las expediciones de la corona española, marcando a Real del Monte como el epicentro mundial de la plata. En 1766, estas minas fueron el escenario de la Primera Huelga de América, un movimiento obrero fundacional donde los mineros exigieron derechos laborales justos y el respeto al 'partido' (la porción de mineral que los trabajadores podían llevarse).",
        highlights: ["Magotsi (otomí)", "1552 · primeras vetas", "Conde de Regla", "1766 · Primera Huelga de América"],
      },
      {
        id: "incursion-britanica",
        title: "La Incursión Británica",
        era: "1824 – 1848",
        body: "Tras la guerra de Independencia, las minas quedaron inundadas y abandonadas. En 1824, la Compañía de Caballeros Aventureros de las Minas de Pachuca y Real del Monte zarpó de Falmouth, Cornualles (Reino Unido), trayendo consigo tecnología revolucionaria: inmensas máquinas de vapor diseñadas por Richard Trevithick y Arthur Woolf. Este hito no solo cambió la minería (permitiendo desaguar los niveles profundos), sino que alteró para siempre el ADN arquitectónico, cultural y social del pueblo. Durante 24 años, los córnicos operaron la región hasta que la crisis financiera los obligó a vender la compañía en 1848 a empresarios mexicanos por la ínfima cantidad de 30,000 pesos.",
        highlights: ["Falmouth, Cornualles", "Trevithick & Woolf", "24 años de operación", "Venta: 30,000 pesos"],
      },
      {
        id: "sociedad-aviadora",
        title: "Sociedad Aviadora y Transición Eléctrica",
        era: "1848 – Siglo XX",
        body: "En 1848 se formó la Sociedad Aviadora de Minas de Pachuca y Real del Monte. Al descubrirse la bonanza de la veta del Rosario (1852), la minería mexicana resurgió con un capital fortalecido. A finales del siglo XIX y principios del XX, las minas como La Dificultad marcaron la transición de la era del vapor a la era de la electricidad, erigiendo majestuosas casas de máquinas que aún dominan el horizonte del pueblo con sus inconfundibles chimeneas de ladrillo rojo y techos de lámina a dos aguas.",
        highlights: ["Veta del Rosario 1852", "Mina La Dificultad", "Vapor → Electricidad"],
      },
    ],
  },
  {
    id: "cultura",
    label: "Cultura, Arte y Sociedad Sincrética",
    glyph: "🎨",
    accent: "electric",
    tagline: "Crisol Mesoamericano · Colonial · Industrial Británico",
    entries: [
      {
        id: "arquitectura-sincretica",
        title: "Arquitectura Sincrética",
        body: "El paisaje urbano de Real del Monte difiere de cualquier otro Pueblo Mágico en México. Sus calles empinadas y empedradas están flanqueadas por casonas que combinan la mampostería española con los techos inclinados de lámina (diseñados para soportar las intensas nevadas y lluvias de la montaña) y chimeneas victorianas. Los portales del centro histórico y los callejones intrincados como el 'Callejón de los Artistas' son un testamento de esta fusión.",
        highlights: ["Mampostería española", "Techos a dos aguas", "Chimeneas victorianas", "Callejón de los Artistas"],
      },
      {
        id: "cuna-futbol",
        title: "La Cuna del Fútbol en México",
        era: "Finales s. XIX",
        body: "Mineral del Monte es la auténtica cuna del balompié nacional. A finales del siglo XIX, los mineros córnicos, al terminar sus extenuantes jornadas, organizaban partidos en los patios de las minas (específicamente en la Mina de Dolores). Este pasatiempo británico se arraigó profundamente en la comunidad local, fundando el primer club de fútbol de México y dejando un legado de pasión por el deporte que perdura hasta el presente.",
        highlights: ["Mina de Dolores", "Primer club de México", "Herencia córnica"],
      },
      {
        id: "orfebreria-plata",
        title: "Orfebrería y Arte en Plata",
        body: "El arte local está intrínsecamente ligado al metal que le dio vida al pueblo. Los talleres de platería en Real del Monte no producen simples souvenirs; forjan piezas de arte que compiten a nivel internacional. Las técnicas de repujado, filigrana y fundición a la cera perdida se han transmitido de generación en generación.",
        highlights: ["Repujado", "Filigrana", "Cera perdida"],
      },
    ],
  },
  {
    id: "gastronomia",
    label: "Gastronomía Endémica",
    glyph: "🍽️",
    accent: "terracotta",
    tagline: "Sabores de la mina · Patrimonio cultural inmaterial",
    entries: [
      {
        id: "paste",
        title: "El Paste (Cornish Pasty)",
        body: "Emblema absoluto de la región. Introducido por los mineros de Cornualles, el paste original consistía en masa recia rellena de papa, nabo, cebolla y carne cruda. Su diseño de ingeniería culinaria incluía una trenza lateral (el repulgue): los mineros sujetaban el paste por esta trenza con manos sucias de arsénico y polvo de mina, comían el cuerpo y desechaban la trenza para evitar envenenamiento. Evolución mexicana: el paladar local incorporó chile, poro y perejil. Hoy el paste tradicional convive con empanadas de mole, frijol con chorizo, tinga, arroz con leche y mermelada de zarzamora.",
        highlights: ["Trenza/repulgue defensivo", "Papa-nabo-cebolla-carne", "Mole · Tinga · Zarzamora"],
      },
      {
        id: "bebidas",
        title: "Bebidas Ancestrales y Terruño",
        body: "Pulque y Curados: la bebida de los dioses. Extraído del corazón del maguey (aguamiel) y fermentado en los tinacales, fue la bebida energética de los mineros. En Real del Monte se consumen curados (pulque mezclado) de frutas de temporada, avena, nuez y piñón. El Cahuiche: pequeña baya silvestre de los bosques de Omitlán y Real del Monte. Su sabor ácido y profundo se utiliza para licores artesanales, mermeladas y rellenos de panadería fina.",
        highlights: ["Aguamiel · Tinacales", "Curados: avena, nuez, piñón", "Cahuiche silvestre"],
      },
      {
        id: "panaderia",
        title: "Panadería Fina y Platillos Tradicionales",
        body: "Cocoles de anís y pan de pulque: horneados en hornos de leña tradicionales, el cocol es un pan con forma de rombo, aromático por el anís y el piloncillo, que suele acompañarse con nata fresca de la región o mermelada. Enchiladas mineras y tacos mineros: comida de esfuerzo. Las enchiladas mineras se sirven en plato hondo, caldosas, picosas y sustanciosas. Los tacos mineros (de guisado en tortilla grande) eran el sustento rápido para las largas jornadas bajo tierra.",
        highlights: ["Cocol de anís y piloncillo", "Pan de pulque", "Enchiladas mineras", "Tacos mineros"],
      },
    ],
  },
  {
    id: "museos",
    label: "Sitios de Interés y Museografía",
    glyph: "🗺️",
    accent: "copper",
    tagline: "Coordenadas monitoreadas por el motor CHRONOS",
    entries: [
      {
        id: "mina-acosta",
        title: "Museo de Sitio Mina de Acosta",
        era: "Siglo XVII – 1985",
        body: "Visita con descenso real a un socavón de 400 metros de profundidad. Los turistas experimentan temperatura constante de 14°C, humedad y oscuridad de las vetas. El complejo alberga maquinaria de vapor original, vestigios de arquitectura británica y cuartos de raya históricos.",
        highlights: ["400 m de profundidad", "14°C constante", "Maquinaria de vapor original"],
        coords: { lat: 20.13720, lng: -98.66950 },

      },
      {
        id: "mina-dificultad",
        title: "Mina La Dificultad",
        body: "Monumento a la era de transición tecnológica. Cuenta con la casa de máquinas más impresionante del país. Exhibe malacates de vapor que fueron modificados para operar con electricidad traída desde la presa de Necaxa. Su museo documenta la historia completa del distrito minero, desde sus orígenes hasta la liquidación de la Compañía Real del Monte y Pachuca en el siglo XX.",
        highlights: ["Casa de máquinas insignia", "Malacates Vapor→Electricidad", "Energía desde Necaxa"],
        coords: { lat: 20.14380, lng: -98.66200 },
      },
      {
        id: "panteon-ingles",
        title: "Panteón Inglés · Santuario del Silencio",
        era: "1851",
        body: "Establecido en una colina envuelta por la niebla y rodeada de pinos y oyameles. Donado por el director de la mina John Rule para sepultar exclusivamente a ingleses de religión protestante, a quienes se les negaba el entierro en cementerios católicos. Contiene 634 tumbas, todas (excepto una) alineadas hacia el este, mirando en dirección a Gran Bretaña. Alberga la tumba del payaso de fama mundial Richard Bell, cuya tumba da la espalda a Inglaterra por voluntad propia, en protesta a su tierra natal que no lo reconoció como sí lo hizo México. También se encuentran tumbas de héroes anónimos de la Primera Guerra Mundial y víctimas de epidemias históricas.",
        highlights: ["634 tumbas hacia el este", "Donado por John Rule", "Richard Bell (payaso)", "Héroes 1GM"],
        coords: { lat: 20.14670, lng: -98.67970 },
      },
      {
        id: "medicina-laboral",
        title: "Museo de Medicina Laboral",
        era: "1907 →",
        body: "Antiguo Hospital Minero. Uno de los pocos recintos en el mundo dedicados a la medicina ocupacional. Fundado para atender los constantes accidentes y enfermedades de los trabajadores del subsuelo. Exhibe instrumental médico victoriano y de principios de siglo XX, boticas originales, quirófanos de época y documentos escalofriantes sobre el tratamiento de la silicosis, la enfermedad del polvo en los pulmones que sentenciaba a muerte a los mineros.",
        highlights: ["Instrumental victoriano", "Boticas y quirófanos originales", "Archivo de silicosis"],
        coords: { lat: 20.14210, lng: -98.67260 },
      },
      {
        id: "zelontla",
        title: "Parroquia de la Asunción · Señor de Zelontla",
        body: "Joya colonial que domina la plaza principal. El Señor de Zelontla, el Cristo Minero, es el protector espiritual del subsuelo. La figura es única: sostiene un cordero, lleva una lámpara de carburo, un casco de minero y un guaje. Representa el sincretismo absoluto de la fe y la labor de la mina.",
        highlights: ["Cordero + lámpara de carburo", "Casco de minero + guaje", "Sincretismo fe-mina"],
        coords: { lat: 20.14290, lng: -98.67390 },
      },
    ],
  },
  {
    id: "ecoturismo",
    label: "Ecoturismo y Soberanía Natural",
    glyph: "🌲",
    accent: "forest",
    tagline: "Pulmón del ecosistema · Barrera natural",
    entries: [
      {
        id: "hiloche",
        title: "Bosque El Hiloche",
        body: "Reserva estatal protegida caracterizada por su densa población de oyameles, encinos y pinos. Es el origen de la famosa neblina que desciende sobre el pueblo. Perfecto para senderismo de bajo impacto, observación de flora y fauna endémica (pájaro carpintero y roedores de alta montaña) y fotografía de paisaje.",
        highlights: ["Oyameles, encinos, pinos", "Origen de la neblina", "Fauna endémica"],
        coords: { lat: 20.16800, lng: -98.71500 },
      },
      {
        id: "penas-cargadas",
        title: "Parque Nacional El Chico · Peñas Cargadas",
        body: "Aunque ligeramente en los límites del municipio, las formaciones basálticas de Peñas Cargadas son un atractivo fundamental. Estas colosales rocas que parecen sostenerse por arte de magia en medio del bosque ofrecen rutas de alpinismo, escalada en roca, tirolesas y áreas para campamentos de inmersión total en la naturaleza.",
        highlights: ["Formaciones basálticas", "Alpinismo · Escalada", "Tirolesas · Campamentos"],
        coords: { lat: 20.20800, lng: -98.71200 },
      },
    ],
  },
  {
    id: "eventos",
    label: "Eventos, Festivales y Cronología",
    glyph: "🎉",
    accent: "gold",
    tagline: "Picos de saturación monitoreados por RDM Digital",
    entries: [
      {
        id: "festival-paste",
        title: "Festival Internacional del Paste",
        era: "Octubre",
        body: "El evento gastronómico más importante de la región. Celebra la herencia británico-mexicana y fortalece los lazos de hermanamiento diplomático con Redruth, Cornualles. Las calles se llenan de panaderos ingleses y mexicanos. Se elaboran miles de pastes en tiempo real, incluyendo la creación del 'Paste Más Grande del Mundo'. Incluye conciertos (desde rock hasta tributos a Queen), conferencias históricas y visitantes internacionales (incluso visitas de la realeza británica).",
        highlights: ["Hermanamiento con Redruth", "Paste Más Grande del Mundo", "Visitas de la realeza"],
      },
      {
        id: "festival-plata",
        title: "Festival de la Plata",
        era: "Julio",
        body: "Honra y reactiva la labor de los artesanos plateros locales y reconoce al minero. La avenida principal se transforma en corredor de exhibición de alta joyería, desde diseños clásicos coloniales hasta propuestas vanguardistas. Callejoneadas, mariachis y degustaciones gastronómicas.",
        highlights: ["Alta joyería de autor", "Callejoneadas", "Reconocimiento al minero"],
      },
      {
        id: "zelontla-fiesta",
        title: "Festividad del Señor de Zelontla",
        era: "Enero",
        body: "La fiesta patronal más emotiva. Los mineros (activos y retirados) cargan la figura del Cristo en una solemne y espectacular procesión nocturna. Las calles se iluminan exclusivamente con lámparas de minero, velas y pirotecnia, creando una atmósfera mística inigualable. La celebración incluye danzas tradicionales, música de banda y feria popular.",
        highlights: ["Procesión nocturna minera", "Lámparas de minero + velas", "Danzas + feria"],
      },
    ],
  },
];

/**
 * Versión plana en texto del corpus, lista para inyectar en el system prompt
 * de Realito AI / ISABELLA v4.0. Mantener bajo ~12k caracteres.
 */
export const RDM_CORPUS_PLAIN: string = RDM_CORPUS.map((section) => {
  const header = `\n## ${section.label.toUpperCase()}\n${section.tagline}\n`;
  const body = section.entries
    .map((e) => `### ${e.title}${e.era ? ` (${e.era})` : ""}\n${e.body}`)
    .join("\n\n");
  return header + body;
}).join("\n");
