// @ts-nocheck
// src/data/rdmTerritoryPOIs.ts
// Núcleo territorial del Nodo Cero Real del Monte / Kernel TAMV.
// Combina POIs canónicos + entidades narrativas (minas, pastes, calles, leyendas, rutas, eventos)
// + utilidades geoespaciales y filtros para IA, juegos, dashboards y RDM Digital.

import type { FederationId } from "./rdmFederations";

import minasImg from "@/lib/placeholder-asset";
import pastesImg from "@/lib/placeholder-asset";
import cementerioImg from "@/lib/placeholder-asset";
import callesImg from "@/lib/placeholder-asset";

//
// ENUMS / TIPOS BÁSICOS
//

export type POICategory =
  | "historico"
  | "mineria"
  | "geologico"
  | "plaza"
  | "mercado"
  | "templo"
  | "escuela";

export type RdmRiskLevel = "low" | "medium" | "high" | "critical";

export type TerritorialRelevance =
  | "core-node" // Núcleo del Nodo Cero
  | "federated-node" // Nodo federado relevante
  | "support-node"; // Nodo de soporte/periferia

export type FederationLayer =
  | "subsuelo" // Capa I
  | "memoria-comestible" // Capa II
  | "memoria-silenciosa" // Capa III
  | "superficie" // Capa IV
  | "economia-local" // Capa V
  | "metadatos" // Capa VI
  | "simulacion"; // Capa VII

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

export type TerritorialLinkKind =
  | "influences"
  | "references"
  | "located-in"
  | "appears-in-route"
  | "appears-in-legend"
  | "economic-link";

export type TerritorialLink = {
  targetId: TerritorialNodeId;
  kind: TerritorialLinkKind;
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
// POIs CANÓNICOS (cartografía física)
//

export interface TerritoryPOI {
  id: string;
  name: string;
  category: POICategory;
  municipality: string;
  lat: number;
  lng: number;
  altitudeM: number;
  description: string;
  significance: string;
  federationId: FederationId;

  riskLevel: RdmRiskLevel;
  relevance: TerritorialRelevance;
  isSacredKernel?: boolean;
}

export const RDM_TERRITORY_POIS: TerritoryPOI[] = [
  {
    id: "rdm-centro",
    name: "Real del Monte (Centro Histórico)",
    category: "historico",
    municipality: "Real del Monte",
    lat: 20.1432,
    lng: -98.6694,
    altitudeM: 2700,
    description: "Cabecera del Nodo Cero. Templo principal del territorio TAMV.",
    significance:
      "Coordenada de fundación de la República Digital. Origen del manuscrito.",
    federationId: "gubernamental",
    riskLevel: "medium",
    relevance: "core-node",
  },
  {
    id: "mina-acosta",
    name: "Mina de Acosta",
    category: "mineria",
    municipality: "Real del Monte",
    lat: 20.1421,
    lng: -98.6712,
    altitudeM: 2680,
    description:
      "Mina cornish del siglo XIX. Eje patrimonial del temporal extractivo.",
    significance:
      "Memoria del trabajo cornish-mexicano. Símbolo de la herida y la resiliencia.",
    federationId: "cultural",
    riskLevel: "high",
    relevance: "federated-node",
  },
  {
    id: "panteon-ingles",
    name: "Panteón Inglés",
    category: "historico",
    municipality: "Real del Monte",
    lat: 20.1455,
    lng: -98.6678,
    altitudeM: 2710,
    description: "Cementerio cornish del siglo XIX, único en su tipo en México.",
    significance:
      "Sincretismo cornish-otomí-mexicano. Federación Cultural.",
    federationId: "cultural",
    riskLevel: "medium",
    relevance: "federated-node",
  },
  {
    id: "pachuca-reloj",
    name: "Pachuca (Reloj Monumental)",
    category: "historico",
    municipality: "Pachuca",
    lat: 20.1234,
    lng: -98.7333,
    altitudeM: 2400,
    description: "Capital político-administrativa del Estado de Hidalgo.",
    significance:
      "Nodo de articulación con el Estado Federal. Sede de relaciones formales.",
    federationId: "gubernamental",
    riskLevel: "medium",
    relevance: "federated-node",
  },
  {
    id: "mineral-chico",
    name: "Mineral del Chico",
    category: "geologico",
    municipality: "Mineral del Chico",
    lat: 20.2167,
    lng: -98.7333,
    altitudeM: 2400,
    description: "Pueblo Mágico, bosque de oyameles, parque nacional.",
    significance: "Federación de Salud y Cultural. Reserva ecocognitiva.",
    federationId: "salud",
    riskLevel: "low",
    relevance: "federated-node",
  },
  {
    id: "plaza-principal",
    name: "Plaza Principal Real del Monte",
    category: "plaza",
    municipality: "Real del Monte",
    lat: 20.1428,
    lng: -98.6691,
    altitudeM: 2700,
    description: "Asambleas federadas, festivales, mercado del paste.",
    significance: "Sede física de la asamblea ciudadana del Nodo Cero.",
    federationId: "gubernamental",
    riskLevel: "medium",
    relevance: "core-node",
  },
  {
    id: "mercado-paste",
    name: "Mercado Soberano del Paste",
    category: "mercado",
    municipality: "Real del Monte",
    lat: 20.143,
    lng: -98.67,
    altitudeM: 2700,
    description:
      "Mercado federado de productores locales bajo el protocolo TAMV.",
    significance:
      "Federación Económica. Punto de circulación de Crédito TAMV.",
    federationId: "economica",
    riskLevel: "medium",
    relevance: "core-node",
  },
  {
    id: "templo-kernel",
    name: "Templo del Kernel TAMV",
    category: "templo",
    municipality: "Real del Monte",
    lat: 20.1438,
    lng: -98.6685,
    altitudeM: 2705,
    description:
      "Espacio simbólico de la Federación Tecnológica. Servidor ritual.",
    significance:
      "Núcleo cognitivo. Isabella Sentinel residencia simbólica.",
    federationId: "tecnologica",
    riskLevel: "high",
    relevance: "core-node",
    isSacredKernel: true,
  },
  {
    id: "universidad-soberana",
    name: "Universidad Soberana",
    category: "escuela",
    municipality: "Real del Monte",
    lat: 20.1445,
    lng: -98.6705,
    altitudeM: 2710,
    description:
      "Sede educativa del territorio. Pedagogía descolonizada.",
    significance:
      "Federación Educativa. Formación de ciudadanos del Nodo Cero.",
    federationId: "educativa",
    riskLevel: "low",
    relevance: "federated-node",
  },
  {
    id: "archivo-oral",
    name: "Archivo Oral Otomí-Cornish",
    category: "historico",
    municipality: "Real del Monte",
    lat: 20.144,
    lng: -98.6695,
    altitudeM: 2700,
    description:
      "Repositorio físico-digital de testimonios y lenguas originarias.",
    significance:
      "Federación Cultural. Custodia de la memoria temporal.",
    federationId: "cultural",
    riskLevel: "high",
    relevance: "core-node",
  },
];

//
// ENTIDADES NARRATIVAS (atlas MD-X4)
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

export type PasteOrigin = "tradicional" | "mestizo" | "contemporáneo";

export type Paste = TerritorialBase & {
  kind: "paste";
  name: string;
  filling: string;
  origin: PasteOrigin;
  note: string;
};

export type Street = TerritorialBase & {
  kind: "street";
  name: string;
  era: string;
  story: string;
};

export type Legend = TerritorialBase & {
  kind: "legend";
  title: string;
  era: string;
  body: string;
};

export type RouteDifficulty = "ligera" | "media" | "alta";

export type Route = TerritorialBase & {
  kind: "route";
  title: string;
  duration: string;
  difficulty: RouteDifficulty;
  steps: string[];
};

export type Event = TerritorialBase & {
  kind: "event";
  name: string;
  date: string;
  place: string;
  description: string;
};

export type Chapter = TerritorialBase & {
  kind: "chapter";
  slug: string;
  title: string;
  kicker: string;
  blurb: string;
  image: string;
  href: string;
};

//
// CAPÍTULOS (Atlas superior)
//

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
// MINAS
//

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
// PASTES
//

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
// CALLES
//

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
// LEYENDAS
//

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
// RUTAS
//

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
// EVENTOS
//

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
// ESTADÍSTICAS / METADATA TERRITORIAL
//

export const territoryStats = {
  altitude: "2 760 m",
  founded: "1552",
  population: "≈ 14 500",
  klmFromCDMX: "120 km",
} as const;

//
// UTILIDADES GEOESPACIALES
// (Haversine para distancia sobre esfera terrestre, patrón usual)
//

export interface LatLng {
  lat: number;
  lng: number;
}

export function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371; // km
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.asin(Math.sqrt(h));
  return R * c;
} // [web:96][web:100][web:103]

export function nearestPOIs(
  origin: LatLng,
  limit = 5,
): Array<TerritoryPOI & { distanceKm: number }> {
  return RDM_TERRITORY_POIS.map((p) => ({
    ...p,
    distanceKm: haversineKm(origin, { lat: p.lat, lng: p.lng }),
  }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);
}

//
// FILTROS / QUERIES PARA IA, DASHBOARDS, JUEGOS
//

export function poisByFederation(federationId: FederationId): TerritoryPOI[] {
  return RDM_TERRITORY_POIS.filter((p) => p.federationId === federationId);
}

export function coreNodePOIs(): TerritoryPOI[] {
  return RDM_TERRITORY_POIS.filter((p) => p.relevance === "core-node");
}

export function highRiskPOIs(): TerritoryPOI[] {
  return RDM_TERRITORY_POIS.filter(
    (p) => p.riskLevel === "high" || p.riskLevel === "critical",
  );
}

export function getSacredKernel(): TerritoryPOI | undefined {
  return RDM_TERRITORY_POIS.find((p) => p.isSacredKernel);
}

/**
 * Grafo ligero: todas las entidades narrativas juntas,
 * útil para engines tipo Isabella, recomendadores, juegos.
 */
export const territorialGraph = {
  chapters,
  mines,
  pastes,
  streets,
  legends,
  routes,
  events,
  pois: RDM_TERRITORY_POIS,
};
