// src/data/territory.ts
// Núcleo de datos territoriales de Real del Monte para el ecosistema MD-X4.
// Pensado como grafo ligero: capítulos, minas, pastes, calles, leyendas, rutas, eventos.
// Cada entidad conoce su capa, conexiones y posibles usos (atlas, juegos, IA, dashboards).

import minasImg from "@/assets/chapter-minas.jpg";
import pastesImg from "@/assets/chapter-pastes.jpg";
import cementerioImg from "@/assets/chapter-cementerio.jpg";
import callesImg from "@/assets/chapter-calles.jpg";

//
// Tipos base y enums
//

export type FederationLayer =
  | "subsuelo" // Capa I
  | "memoria-comestible" // Capa II
  | "memoria-silenciosa" // Capa III
  | "superficie" // Capa IV
  | "economia-local" // Capa V (ej. juegos/recompensas)
  | "metadatos" // Capa VI (datos, DOIs, ORCID, etc.)
  | "simulacion"; // Capa VII (juegos, gemelos, IA)

export type ImportanceLevel = 1 | 2 | 3; // 1 = referencia, 3 = detalle

export type TerritorialEntityKind =
  | "chapter"
  | "mine"
  | "paste"
  | "street"
  | "legend"
  | "route"
  | "event";

export type TerritorialNodeId = string;

export type TerritorialLink = {
  targetId: TerritorialNodeId;
  kind:
    | "influences"
    | "references"
    | "located-in"
    | "appears-in-route"
    | "appears-in-legend"
    | "economic-link";
};

export interface TerritorialBase {
  id: TerritorialNodeId;
  kind: TerritorialEntityKind;
  federationLayer: FederationLayer;
  importance: ImportanceLevel;
  tags: string[];
  links?: TerritorialLink[];
}

//
// Capítulos (Atlas)
//

export type Chapter = TerritorialBase & {
  kind: "chapter";
  slug: string;
  title: string;
  kicker: string;
  blurb: string;
  image: string;
  href: string;
};

export const chapters: Chapter[] = [
  {
    id: "chapter-minas",
    kind: "chapter",
    federationLayer: "subsuelo",
    importance: 1,
    tags: ["minas", "patrimonio-industrial", "subsuelo"],
    slug: "minas",
    title: "Las minas",
    kicker: "Capa I · Subsuelo",
    blurb:
      "Bajo el pueblo respira una segunda geografía. Galerías que sostuvieron la plata del mundo y dieron forma a todo lo que está arriba.",
    image: minasImg,
    href: "/minas",
    links: [
      { targetId: "mine-acosta", kind: "references" },
      { targetId: "mine-dolores", kind: "references" },
      { targetId: "route-patrimonio-minero", kind: "appears-in-route" },
    ],
  },
  {
    id: "chapter-pastes",
    kind: "chapter",
    federationLayer: "memoria-comestible",
    importance: 1,
    tags: ["pastes", "gastronomia", "memoria-comestible"],
    slug: "pastes",
    title: "Los pastes",
    kicker: "Capa II · Memoria comestible",
    blurb:
      "Llegaron en bolsillos de mineros cornish y se quedaron como ofrenda diaria. Cada paste es una negociación entre dos países que aprendieron a convivir.",
    image: pastesImg,
    href: "/pastes",
    links: [
      { targetId: "paste-carne-papa", kind: "references" },
      { targetId: "paste-mole-verde", kind: "references" },
      { targetId: "route-calles-pastes", kind: "appears-in-route" },
    ],
  },
  {
    id: "chapter-cementerio",
    kind: "chapter",
    federationLayer: "memoria-silenciosa",
    importance: 1,
    tags: ["cementerio-ingles", "patrimonio", "memoria"],
    slug: "cementerio",
    title: "El cementerio inglés",
    kicker: "Capa III · Memoria silenciosa",
    blurb:
      "Las cruces miran hacia Cornualles. Aquí descansan quienes nunca volvieron a casa y, sin saberlo, fundaron otra.",
    image: cementerioImg,
    href: "/cementerio",
    links: [
      { targetId: "event-noche-cementerio", kind: "appears-in-route" },
      { targetId: "legend-campana-cornualles", kind: "appears-in-legend" },
    ],
  },
  {
    id: "chapter-calles",
    kind: "chapter",
    federationLayer: "superficie",
    importance: 1,
    tags: ["calles", "tejido-urbano", "superficie"],
    slug: "calles",
    title: "Las calles",
    kicker: "Capa IV · Superficie",
    blurb:
      "Bajan en pendientes imposibles, doblan donde la roca lo permitió. Cada esquina recuerda un nombre que casi nadie pronuncia ya.",
    image: callesImg,
    href: "/calles",
    links: [
      { targetId: "street-hidalgo", kind: "references" },
      { targetId: "street-constitucion", kind: "references" },
      { targetId: "route-calles-pastes", kind: "appears-in-route" },
    ],
  },
];

//
// Minas
//

export type MineStatus = "patrimonio" | "visitable" | "memoria";

export type Mine = TerritorialBase & {
  kind: "mine";
  name: string;
  founded: string;
  status: MineStatus;
  description: string;
  connections: string[];
};

export const mines: Mine[] = [
  {
    id: "mine-acosta",
    kind: "mine",
    federationLayer: "subsuelo",
    importance: 1,
    tags: ["mina", "museo", "patrimonio-industrial", "visitable"],
    name: "Mina de Acosta",
    founded: "1727",
    status: "visitable",
    description:
      "Una de las pocas minas activas convertidas en museo vivo. Sus malacates aún se mueven; sus túneles aún huelen a humedad y carburo.",
    connections: ["Pachuca", "Cornualles", "Compañía Real del Monte y Pachuca"],
    links: [
      { targetId: "chapter-minas", kind: "appears-in-route" },
      { targetId: "route-patrimonio-minero", kind: "appears-in-route" },
    ],
  },
  {
    id: "mine-dolores",
    kind: "mine",
    federationLayer: "subsuelo",
    importance: 2,
    tags: ["mina", "huelga", "memoria-historica"],
    name: "Mina de Dolores",
    founded: "1739",
    status: "memoria",
    description:
      "Centro del primer paro minero de América en 1766. Una huelga que precedió en una década a la independencia de los Estados Unidos.",
    connections: ["Conde de Regla", "Huelga de 1766", "Plata novohispana"],
    links: [{ targetId: "legend-conde-veta-perdida", kind: "appears-in-legend" }],
  },
  {
    id: "mine-santa-ines",
    kind: "mine",
    federationLayer: "subsuelo",
    importance: 2,
    tags: ["mina", "tecnologia", "migracion-britanica"],
    name: "Mina de Santa Inés",
    founded: "1801",
    status: "patrimonio",
    description:
      "Sus tiros descendieron más de 400 metros bajo el nivel del mar interior. Hoy se preserva como sitio de memoria industrial.",
    connections: ["Tecnología Cornish", "Bombas de vapor", "Migración británica"],
  },
  {
    id: "mine-san-juan-pachuca",
    kind: "mine",
    federationLayer: "subsuelo",
    importance: 2,
    tags: ["mina", "siglo-xix", "infraestructura"],
    name: "Mina de San Juan Pachuca",
    founded: "1850",
    status: "patrimonio",
    description:
      "Última gran obra del ciclo minero del siglo XIX. Su malacate aún corona el horizonte.",
    connections: ["Ciclo decimonónico", "Acueducto", "Ferrocarril"],
  },
];

//
// Pastes
//

export type PasteOrigin = "tradicional" | "mestizo" | "contemporáneo";

export type Paste = TerritorialBase & {
  kind: "paste";
  name: string;
  filling: string;
  origin: PasteOrigin;
  note: string;
};

export const pastes: Paste[] = [
  {
    id: "paste-carne-papa",
    kind: "paste",
    federationLayer: "memoria-comestible",
    importance: 1,
    tags: ["cornish", "tradicional", "salado"],
    name: "Paste de carne con papa",
    filling: "Res, papa, poro, especias",
    origin: "tradicional",
    note: "El original cornish, adaptado al maíz y al chile de la sierra.",
    links: [{ targetId: "chapter-pastes", kind: "appears-in-route" }],
  },
  {
    id: "paste-mole-verde",
    kind: "paste",
    federationLayer: "memoria-comestible",
    importance: 2,
    tags: ["mestizo", "mole-verde"],
    name: "Paste de mole verde",
    filling: "Pollo, mole de pepita",
    origin: "mestizo",
    note: "Cuando el bolsillo del minero se llenó de cocina mexicana.",
  },
  {
    id: "paste-tinga",
    kind: "paste",
    federationLayer: "memoria-comestible",
    importance: 2,
    tags: ["mestizo", "tinga"],
    name: "Paste de tinga",
    filling: "Pollo deshebrado, chipotle, jitomate",
    origin: "mestizo",
    note: "Hidalgo entrando por la puerta lateral del horno.",
  },
  {
    id: "paste-pina",
    kind: "paste",
    federationLayer: "memoria-comestible",
    importance: 3,
    tags: ["tradicional", "dulce"],
    name: "Paste de piña",
    filling: "Piña caramelizada",
    origin: "tradicional",
    note: "El postre que terminaba la jornada bajo tierra.",
  },
  {
    id: "paste-arroz-leche",
    kind: "paste",
    federationLayer: "memoria-comestible",
    importance: 3,
    tags: ["contemporaneo", "dulce"],
    name: "Paste de arroz con leche",
    filling: "Arroz, leche, canela",
    origin: "contemporáneo",
    note: "La cocina de la abuela traducida a pasta hojaldrada.",
  },
];

//
// Calles
//

export type Street = TerritorialBase & {
  kind: "street";
  name: string;
  era: string;
  story: string;
};

export const streets: Street[] = [
  {
    id: "street-hidalgo",
    kind: "street",
    federationLayer: "superficie",
    importance: 1,
    tags: ["comercio", "eje-principal"],
    name: "Calle Hidalgo",
    era: "Siglo XIX",
    story:
      "Eje principal del comercio. Aquí caminaron mineros, comerciantes ingleses y arrieros de Pachuca.",
  },
  {
    id: "street-callejon-conde",
    kind: "street",
    federationLayer: "superficie",
    importance: 2,
    tags: ["mirador", "conde-de-regla"],
    name: "Callejón del Conde",
    era: "Siglo XVIII",
    story:
      "Ruta privada del Conde de Regla. Hoy es uno de los miradores más silenciosos del pueblo.",
  },
  {
    id: "street-constitucion",
    kind: "street",
    federationLayer: "superficie",
    importance: 2,
    tags: ["arquitectura-cornish", "vivienda"],
    name: "Calle Constitución",
    era: "Siglo XIX",
    story:
      "Casas blancas y rojas que aprendieron de la arquitectura cornish a inclinar el tejado contra la lluvia.",
  },
  {
    id: "street-mariano-jimenez",
    kind: "street",
    federationLayer: "superficie",
    importance: 3,
    tags: ["politica", "siglo-xx"],
    name: "Calle Mariano Jiménez",
    era: "Siglo XX",
    story:
      "Bautizada en honor al insurgente. Aquí se firmó parte de la historia política de la sierra.",
  },
];

//
// Leyendas
//

export type Legend = TerritorialBase & {
  kind: "legend";
  title: string;
  era: string;
  body: string;
};

export const legends: Legend[] = [
  {
    id: "legend-novia-mina",
    kind: "legend",
    federationLayer: "memoria-silenciosa",
    importance: 2,
    tags: ["mina", "aparicion", "guia"],
    title: "La novia de la mina",
    era: "Tradición oral",
    body: "Cuentan que en las galerías más profundas, los mineros encontraban a una mujer vestida de blanco. No los asustaba. Los guiaba hacia la veta. Y a veces, los acompañaba a la salida.",
  },
  {
    id: "legend-campana-cornualles",
    kind: "legend",
    federationLayer: "memoria-silenciosa",
    importance: 2,
    tags: ["campana", "cornualles", "muerte"],
    title: "La campana de Cornualles",
    era: "Siglo XIX",
    body: "Trajeron una campana desde Inglaterra para llamar a la jornada. Cuando sonaba por la noche sin que nadie la tocara, los mineros entendían que alguien había muerto bajo tierra.",
  },
  {
    id: "legend-conde-veta-perdida",
    kind: "legend",
    federationLayer: "memoria-silenciosa",
    importance: 3,
    tags: ["conde-de-regla", "veta-perdida"],
    title: "El conde y la veta perdida",
    era: "Siglo XVIII",
    body: "Se dice que el Conde de Regla escondió un mapa con la veta más rica del distrito. Nunca apareció. Algunos creen que sigue debajo del pueblo, esperando.",
  },
];

//
// Rutas
//

export type RouteDifficulty = "ligera" | "media" | "alta";

export type Route = TerritorialBase & {
  kind: "route";
  title: string;
  duration: string;
  difficulty: RouteDifficulty;
  steps: string[];
};

export const routes: Route[] = [
  {
    id: "route-patrimonio-minero",
    kind: "route",
    federationLayer: "simulacion",
    importance: 1,
    tags: ["mina", "patrimonio", "ruta-guiada"],
    title: "Ruta del patrimonio minero",
    duration: "3 h",
    difficulty: "media",
    steps: [
      "Mina de Acosta — descenso guiado",
      "Museo de Sitio Mina de Acosta",
      "Panteón Inglés",
      "Mirador del Hiloche",
    ],
    links: [
      { targetId: "mine-acosta", kind: "appears-in-route" },
      { targetId: "chapter-minas", kind: "appears-in-route" },
    ],
  },
  {
    id: "route-calles-pastes",
    kind: "route",
    federationLayer: "simulacion",
    importance: 1,
    tags: ["calles", "pastes", "miradores"],
    title: "Calles, pastes y miradores",
    duration: "2 h",
    difficulty: "ligera",
    steps: [
      "Plaza Principal",
      "Recorrido por la Calle Hidalgo",
      "Degustación en una pastería tradicional",
      "Mirador hacia Pachuca",
    ],
    links: [
      { targetId: "street-hidalgo", kind: "appears-in-route" },
      { targetId: "paste-carne-papa", kind: "appears-in-route" },
    ],
  },
  {
    id: "route-leyendas",
    kind: "route",
    federationLayer: "simulacion",
    importance: 2,
    tags: ["leyendas", "noche", "cementerio"],
    title: "Ruta de leyendas al atardecer",
    duration: "1.5 h",
    difficulty: "ligera",
    steps: [
      "Callejón del Conde",
      "Cementerio Inglés al ocaso",
      "Casas embrujadas de la Calle Constitución",
    ],
    links: [
      { targetId: "street-callejon-conde", kind: "appears-in-route" },
      { targetId: "chapter-cementerio", kind: "appears-in-route" },
    ],
  },
];

//
// Eventos
//

export type Event = TerritorialBase & {
  kind: "event";
  name: string;
  date: string;
  place: string;
  description: string;
};

export const events: Event[] = [
  {
    id: "event-festival-paste",
    kind: "event",
    federationLayer: "economia-local",
    importance: 1,
    tags: ["festival", "paste", "gastronomia"],
    name: "Festival Internacional del Paste",
    date: "Octubre",
    place: "Centro de Real del Monte",
    description:
      "El encuentro más importante entre Hidalgo y Cornualles. Talleres, concursos y mesas de cocina viva.",
  },
  {
    id: "event-dia-minero",
    kind: "event",
    federationLayer: "memoria-silenciosa",
    importance: 2,
    tags: ["minero", "procesion", "memoria"],
    name: "Día del Minero",
    date: "11 de julio",
    place: "Plaza Principal",
    description:
      "Procesión, ofrendas y memoria viva de quienes hicieron de la plata el lenguaje del pueblo.",
  },
  {
    id: "event-noche-cementerio",
    kind: "event",
    federationLayer: "memoria-silenciosa",
    importance: 2,
    tags: ["noche", "cementerio-ingles", "recorrido"],
    name: "Noche del Panteón Inglés",
    date: "Finales de octubre",
    place: "Panteón Inglés",
    description:
      "Recorrido nocturno con narradores. La memoria mira hacia Cornualles bajo la luz de las velas.",
  },
];

//
// Estadísticas y metadata territorial
//

export const territoryStats = {
  altitude: "2 760 m",
  founded: "1552",
  population: "≈ 14 500",
  klmFromCDMX: "120 km",
} as const;
