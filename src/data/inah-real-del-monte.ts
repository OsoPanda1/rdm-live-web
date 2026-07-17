/**
 * Fuente primaria: Instituto Nacional de Antropología e Historia (INAH)
 * Guía turística "Real del Monte, Hidalgo" (2004)
 * https://repositorio.inah.gob.mx/o-26968
 *
 * Créditos:
 *  - Texto: Departamento de Difusión, Centro INAH Hidalgo.
 *  - Información: Arq. Erasmo Cordero Hernández.
 *  - Fotografía: Elisa Nadurille Álvarez.
 *  - Edición: CONACULTA · INAH (Dirección de Publicaciones, Coordinación Nacional de Difusión).
 *
 * Licencia: Creative Commons BY-NC-ND 4.0.
 * © Secretaría de Cultura · Instituto Nacional de Antropología e Historia · México (2004).
 *
 * Este archivo alimenta la base de conocimiento territorial de Isabella y las
 * secciones históricas del ecosistema RDM Digital LTOS. No modificar sin
 * conservar la atribución al INAH y su licencia CC BY-NC-ND 4.0.
 */

import coverAsset from "@/assets/inah-real-del-monte-cover.jpg.asset.json";

export interface InahSource {
  id: string;
  title: string;
  subtitle: string;
  publisher: string;
  year: number;
  license: string;
  licenseUrl: string;
  canonicalUrl: string;
  pdfUrl: string;
  coverUrl: string;
  contributors: {
    text: string;
    research: string;
    photography: string;
    editors: string[];
  };
  coverage: {
    topics: string[];
    period: string;
    geography: string[];
  };
}

export const INAH_REAL_DEL_MONTE_SOURCE: InahSource = {
  id: "inah-o-26968",
  title: "Real del Monte",
  subtitle: "Hidalgo",
  publisher: "Instituto Nacional de Antropología e Historia (INAH)",
  year: 2004,
  license: "CC BY-NC-ND 4.0",
  licenseUrl: "https://creativecommons.org/licenses/by-nc-nd/4.0/deed.es",
  canonicalUrl: "https://repositorio.inah.gob.mx/o-26968",
  pdfUrl: "https://repositorio.inah.gob.mx/_flysystem/fedora/2023-12/guia_196.pdf",
  coverUrl: coverAsset.url,
  contributors: {
    text: "Departamento de Difusión, Centro INAH Hidalgo",
    research: "Arq. Erasmo Cordero Hernández",
    photography: "Elisa Nadurille Álvarez",
    editors: [
      "Consejo Nacional para la Cultura y las Artes (CONACULTA)",
      "Instituto Nacional de Antropología e Historia (INAH)",
    ],
  },
  coverage: {
    topics: [
      "Monumentos históricos",
      "Bienes culturales",
      "Arquitectura",
      "Templos",
      "Comercio",
      "Minería",
      "Haciendas",
    ],
    period: "Siglo XVI en adelante",
    geography: ["América del Norte", "México", "Hidalgo", "Real del Monte"],
  },
};

export interface InahKnowledgeEntry {
  id: string;
  title: string;
  section: "toponimia" | "historia" | "religioso" | "industrial" | "civil" | "acceso";
  body: string;
  tags: string[];
}

export const INAH_KNOWLEDGE: InahKnowledgeEntry[] = [
  {
    id: "toponimia-maghotsi",
    title: "Toponimia otomí: Maghotsi",
    section: "toponimia",
    tags: ["otomí", "Maghotsi", "El Hiloche", "toponimia"],
    body:
      "Antes de la conquista, a Mineral del Monte se le conoció como Maghotsi, " +
      "cuyas raíces otomíes son Ma (altura) y Ghotso (paso), es decir, 'Paso por " +
      "la Altura'. Era la parte más elevada del camino que venía de la Huasteca a " +
      "la Gran Tenochtitlan. El nombre de Maghotsi derivó en El Ghtsi y finalmente " +
      "en El Hiloche, con el que se conoce al bosque de encinas gigantes al " +
      "poniente de la población.",
  },
  {
    id: "fundacion-1552",
    title: "Fundación oficial (1552) y categoría de municipio (1934)",
    section: "historia",
    tags: ["fundación", "1552", "municipio", "1934"],
    body:
      "El poblado se fundó oficialmente en 1552 con el nombre de Real del Monte, " +
      "derivado de la costumbre española de designar como 'Real' a los minerales " +
      "extraídos de las montañas. Recibió la categoría de municipio, ya como " +
      "Mineral del Monte, el 8 de mayo de 1934.",
  },
  {
    id: "veta-santa-brigida",
    title: "Veta de Santa Brígida y auge argentífero",
    section: "historia",
    tags: ["minería", "plata", "Santa Brígida", "siglo XVII", "siglo XVIII"],
    body:
      "La ciudad fue fundada en el siglo XVI como resultado del descubrimiento de " +
      "yacimientos argentíferos, entre ellos la veta de Santa Brígida, que animó " +
      "el desarrollo económico de la región principalmente durante los siglos " +
      "XVII y XVIII.",
  },
  {
    id: "proceso-de-patio",
    title: "Proceso de Patio: Bartolomé de Medina",
    section: "historia",
    tags: ["Bartolomé de Medina", "azogue", "proceso de patio", "plata"],
    body:
      "En la región minera de Pachuca y Real del Monte, Bartolomé de Medina " +
      "introdujo por primera vez el método para el tratamiento de la plata por " +
      "medio de azogue conocido como 'Proceso de Patio', desplazando a los " +
      "antiguos procedimientos de fundición y dando nuevo impulso a la minería " +
      "en toda la Nueva España y las regiones mineras de la actual América del Sur.",
  },
  {
    id: "primera-huelga-1766",
    title: "Primera huelga obrera de América (15 de agosto de 1766)",
    section: "historia",
    tags: ["huelga", "1766", "movimiento obrero"],
    body:
      "Esta ciudad fue escenario de la primera huelga obrera en México y América " +
      "Latina, iniciada el 15 de agosto de 1766.",
  },
  {
    id: "casas-quemadas-1866",
    title: "Acción de Casas Quemadas (8 de noviembre de 1866)",
    section: "historia",
    tags: ["intervención francesa", "1866", "Casas Quemadas", "soberanía"],
    body:
      "Durante la intervención francesa fue escenario de la defensa de la " +
      "soberanía nacional el 8 de noviembre de 1866, cuando en la 'Acción de " +
      "Casas Quemadas' fuerzas de la Defensa Nacional derrotaron a un conjunto " +
      "de militares austriacos.",
  },
  {
    id: "romero-de-terreros",
    title: "Pedro Romero de Terreros y el Nacional Monte de Piedad (1775)",
    section: "historia",
    tags: ["Pedro Romero de Terreros", "Monte de Piedad", "1775"],
    body:
      "Pedro Romero de Terreros impulsó y organizó la explotación de las minas " +
      "de Mineral del Monte y Pachuca, lo que le permitió realizar obras en bien " +
      "de la comunidad, como la fundación del Nacional Monte de Piedad en 1775. " +
      "Su antigua casa se ubica en la calle de Aldama.",
  },
  {
    id: "parroquia-rosario",
    title: "Parroquia de Nuestra Señora del Rosario",
    section: "religioso",
    tags: ["parroquia", "Rosario", "Plaza Hidalgo", "siglo XVII"],
    body:
      "Ubicada en la Plaza Hidalgo, la parroquia fue construida en el siglo XVII " +
      "con muros de mampostería que soportan una cubierta de bóveda de cañón " +
      "corrido con lunetas, piso de madera y planta de cruz latina. La fachada " +
      "presenta un acceso con arco de medio punto y una capilla abierta que se " +
      "comunica con el coro, enmarcada por dos torres-campanario de dos cuerpos.",
  },
  {
    id: "capilla-santa-veracruz",
    title: "Capilla de la Santa Veracruz",
    section: "religioso",
    tags: ["Santa Veracruz", "franciscanos", "siglo XVII"],
    body:
      "Localizada entre las calles General Tapia (Veracruz), Morelos y Cortés, " +
      "es el segundo templo que construyeron en Mineral del Monte los " +
      "franciscanos de Pachuca. De mediados del siglo XVII, sus muros de " +
      "mampostería sostienen una bóveda con lunetas y una cúpula con linternilla " +
      "en el crucero. La fachada presenta al centro un acceso con cerramiento de " +
      "medio punto con arquivolta moldurada y enjutas con guirnaldas y flores; a " +
      "la izquierda una torre cuadrada de dos cuerpos.",
  },
  {
    id: "capilla-zelontla",
    title: "Capilla del Señor de Zelontla",
    section: "religioso",
    tags: ["Zelontla", "neoclásico"],
    body:
      "Se ubica en la calle de Hidalgo esquina con Morelos. Está conformada por " +
      "una sola nave con muros de mampostería que sostienen una cubierta de " +
      "bóveda de cañón. Presenta una fachada lisa hacia el oriente de estilo " +
      "neoclásico.",
  },
  {
    id: "haciendas-beneficio",
    title: "Haciendas de beneficio y tiros mineros",
    section: "industrial",
    tags: ["haciendas de beneficio", "chacuacos", "minas", "arquitectura industrial"],
    body:
      "La arquitectura industrial de la época colonial propició la edificación de " +
      "haciendas de beneficio y tiros de mina en las orillas de la población, " +
      "siguiendo la trayectoria del río. Destacan: La Dificultad (sobre la " +
      "carretera Pachuca–Tampico), San Cayetano (calle de Hidalgo, hoy Escuela " +
      "de Artes de la UAEH), San José La Rica, Acosta (calle de Guerrero, hoy " +
      "museo), De Dolores (entre Guerrero y Gómez Farías) y De Purísima. Sus " +
      "chacuacos y horcas se integran a la imagen de sube y baja característica " +
      "de una ciudad minera.",
  },
  {
    id: "arquitectura-civil",
    title: "Arquitectura civil vernácula-popular",
    section: "civil",
    tags: ["vivienda", "mampostería", "adobe", "lámina de zinc", "tejamanil"],
    body:
      "Las construcciones civiles predominan como vivienda y comercio, este " +
      "último principalmente sobre la calle Hidalgo. La arquitectura vernácula-" +
      "popular se construye con muros de mampostería y adobe que sostienen " +
      "cubiertas originalmente de teja y tejamanil, hoy sustituidas por lámina " +
      "de zinc, insertándose de forma escalonada en la topografía irregular.",
  },
  {
    id: "inmuebles-historicos",
    title: "Inmuebles históricos destacados",
    section: "civil",
    tags: ["Aldama", "Hospital Civil", "Plaza Hidalgo", "Panteón Inglés", "Mercado"],
    body:
      "Sobresalen la Casa de Pedro Romero de Terreros (calle de Aldama), el " +
      "Hospital Civil o ex Hospital (calle del Hospital), la Fuente en la Plaza " +
      "Hidalgo, la Casa de Cultura (calle Camerino Mendoza y Plaza Hidalgo), el " +
      "Mercado Camerino Mendoza (calle Hidalgo) y el Antiguo Panteón Inglés en " +
      "la parte alta al surponiente de la población.",
  },
  {
    id: "como-llegar",
    title: "Cómo llegar",
    section: "acceso",
    tags: ["autopista", "México-Pachuca", "carretera 105", "corredor turístico"],
    body:
      "Desde la Ciudad de México se toma la autopista México–Pachuca y se " +
      "prosigue por la carretera federal número 105 Pachuca–Tampico, o bien por " +
      "la autopista del Corredor Turístico de la Montaña, hasta llegar a Mineral " +
      "del Monte.",
  },
];

/** Corpus plano listo para embeddings / RAG de Isabella. */
export const INAH_CORPUS_TEXT: string = INAH_KNOWLEDGE.map(
  (entry) => `# ${entry.title}\n${entry.body}`,
).join("\n\n");

export function findInahEntries(query: string): InahKnowledgeEntry[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];
  return INAH_KNOWLEDGE.filter((entry) => {
    const haystack = `${entry.title} ${entry.body} ${entry.tags.join(" ")}`.toLowerCase();
    return haystack.includes(needle);
  });
}
