// @ts-nocheck
// Centralized rich dataset for Real del Monte — used across map, pages and Isabella AI.
// Single source of truth: history, culture, gastronomy, legends, routes.

import rdmMina from "@/lib/placeholder-asset";
import rdmPanteon from "@/lib/placeholder-asset";
import rdmMalacate from "@/lib/placeholder-asset";
import rdmPlaza from "@/lib/placeholder-asset";
import rdmPastes from "@/lib/placeholder-asset";
import rdmCafe from "@/lib/placeholder-asset";
import rdmCalleColonial from "@/lib/placeholder-asset";
import rdmCallejon from "@/lib/placeholder-asset";
import rdmIglesia from "@/lib/placeholder-asset";
import rdmFestival from "@/lib/placeholder-asset";
import rdmDiaMuertos from "@/lib/placeholder-asset";
import rdmSierra from "@/lib/placeholder-asset";
import rdmMirador from "@/lib/placeholder-asset";
import rdmArtesanias from "@/lib/placeholder-asset";

export type RdmCategory =
  | "Historia"
  | "Cultura"
  | "Gastronomía"
  | "Ecoturismo"
  | "Patrimonio"
  | "Religioso"
  | "Aventura"
  | "Leyenda";

export interface RdmPoi {
  id: string;
  name: string;
  category: RdmCategory;
  short: string;
  story: string;
  image: string;
  lat: number;
  lng: number;
  era?: string;
  tags?: string[];
  rating?: number;
}

export const RDM_POIS: RdmPoi[] = [
  {
    id: "mina-acosta",
    name: "Mina de Acosta",
    category: "Historia",
    era: "1727 — presente",
    short: "460 años de historia minera bajo tierra.",
    story:
      "Descender por el tiro de Acosta es bajar 400 metros al corazón de la sierra. Aquí extraían plata los cornish con tecnología de vapor, y aquí estalló en 1766 una de las primeras huelgas de América.",
    image: rdmMina,
    lat: 20.1461,
    lng: -98.6703,
    tags: ["minería", "cornish", "tour subterráneo"],
    rating: 4.9,
  },
  {
    id: "panteon-ingles",
    name: "Panteón Inglés",
    category: "Patrimonio",
    era: "1851",
    short: "Tumbas que miran hacia Cornwall.",
    story:
      "Único cementerio de su tipo en América Latina: 755 tumbas alineadas hacia Inglaterra. Solo una mira al lado opuesto: la del payaso Richard Bell, que pidió ser enterrado mirando a su público.",
    image: rdmPanteon,
    lat: 20.1428,
    lng: -98.6762,
    tags: ["herencia británica", "memoria", "fotografía"],
    rating: 4.8,
  },
  {
    id: "plaza-principal",
    name: "Plaza Principal Juárez",
    category: "Patrimonio",
    era: "Siglo XVIII",
    short: "El corazón colonial del pueblo mágico.",
    story:
      "Rodeada de portales, cantinas centenarias y la parroquia. Punto de partida de toda visita y escenario de las fiestas patronales más vibrantes del estado.",
    image: rdmPlaza,
    lat: 20.1384,
    lng: -98.6735,
    tags: ["centro histórico", "encuentro"],
    rating: 4.7,
  },
  {
    id: "parroquia-asuncion",
    name: "Parroquia de la Asunción",
    category: "Religioso",
    era: "1572",
    short: "Templo donde tañen campanas fantasma.",
    story:
      "Levantada por agustinos en piedra rosada local. Cada 2 de noviembre, dicen, la campana mayor suena tres veces sola: son los mineros pidiendo no ser olvidados.",
    image: rdmIglesia,
    lat: 20.1387,
    lng: -98.6738,
    tags: ["arquitectura virreinal", "leyenda"],
    rating: 4.7,
  },
  {
    id: "museo-paste",
    name: "Museo del Paste",
    category: "Gastronomía",
    era: "2010",
    short: "La cuna del paste mexicano.",
    story:
      "Recorre 200 años de fusión cornish-mexicana. Aprende a doblar la masa con el repulgue de 14 pliegues y hornea tu propio paste de papa con carne.",
    image: rdmPastes,
    lat: 20.1381,
    lng: -98.6726,
    tags: ["taller", "degustación", "imperdible"],
    rating: 4.9,
  },
  {
    id: "callejon-diamante",
    name: "Callejón del Diamante",
    category: "Leyenda",
    era: "Leyenda viva",
    short: "Donde aparece la Dama de Blanco.",
    story:
      "En noches de neblina densa, una mujer vestida de blanco aparece al final del callejón llamando con voz de campanas. Quien la sigue, no regresa el mismo.",
    image: rdmCallejon,
    lat: 20.1391,
    lng: -98.6742,
    tags: ["nocturno", "tour de leyendas"],
    rating: 4.6,
  },
  {
    id: "mirador-cerro",
    name: "Mirador Cerro del Judío",
    category: "Ecoturismo",
    era: "Naturaleza",
    short: "Vista 360° del valle minero.",
    story:
      "20 minutos de caminata desde el centro. Al amanecer la neblina se quiebra sobre los malacates y se ven las luces de Pachuca. Punto fotográfico número uno.",
    image: rdmMirador,
    lat: 20.1452,
    lng: -98.6657,
    tags: ["sunrise", "fotografía", "trekking"],
    rating: 4.9,
  },
  {
    id: "bosque-hiloche",
    name: "Bosque del Hiloche",
    category: "Ecoturismo",
    era: "Reserva",
    short: "Senderos entre encinos centenarios.",
    story:
      "320 hectáreas de bosque donde habitan los duendes según los viejos. Tres senderos señalizados, área de campamento y tirolesas para los más aventureros.",
    image: rdmSierra,
    lat: 20.1302,
    lng: -98.6624,
    tags: ["camping", "tirolesa", "fauna"],
    rating: 4.7,
  },
  {
    id: "malacate-dolores",
    name: "Malacate de Dolores",
    category: "Historia",
    era: "1850",
    short: "Símbolo industrial de la sierra.",
    story:
      "Estructura de madera y acero que extraía mineral del subsuelo. Restaurado y visible desde varios puntos del pueblo, se ilumina cada noche.",
    image: rdmMalacate,
    lat: 20.1417,
    lng: -98.6754,
    tags: ["arqueología industrial"],
    rating: 4.6,
  },
  {
    id: "calle-cuauhtemoc",
    name: "Calle Cuauhtémoc Colonial",
    category: "Patrimonio",
    era: "Siglo XIX",
    short: "Adoquín, balcones y techos rojos.",
    story:
      "La postal clásica de Real del Monte. Casas pintadas con cal, ventanas de madera y geranios. Caminar al atardecer es entrar a otro siglo.",
    image: rdmCalleColonial,
    lat: 20.1386,
    lng: -98.6732,
    tags: ["walking tour"],
    rating: 4.8,
  },
  {
    id: "cafe-real",
    name: "Café de Olla del Real",
    category: "Gastronomía",
    era: "Tradición",
    short: "Café con piloncillo y canela.",
    story:
      "El abrazo líquido perfecto para el frío de montaña. Servido en jarro de barro, acompaña cualquier paste o pan dulce de la región.",
    image: rdmCafe,
    lat: 20.1385,
    lng: -98.6736,
    tags: ["bebida típica"],
    rating: 4.7,
  },
  {
    id: "tianguis-artesanal",
    name: "Tianguis Artesanal",
    category: "Cultura",
    era: "Sábados y domingos",
    short: "Plata, cobre y madera labrada.",
    story:
      "Más de 60 artesanos exhiben piezas únicas: réplicas en miniatura de malacates, joyería en plata 0.925 y juguetes de madera tallados a mano.",
    image: rdmArtesanias,
    lat: 20.1382,
    lng: -98.6741,
    tags: ["compras", "souvenir"],
    rating: 4.6,
  },
  {
    id: "festival-paste",
    name: "Festival Internacional del Paste",
    category: "Cultura",
    era: "Octubre",
    short: "5 días, 60 sabores, 80,000 visitantes.",
    story:
      "Cada octubre el pueblo se viste de fiesta para celebrar su platillo emblema. Concursos, conciertos y la elección del Mejor Paste de México.",
    image: rdmFestival,
    lat: 20.1383,
    lng: -98.6737,
    tags: ["evento anual", "imperdible"],
    rating: 5.0,
  },
  {
    id: "dia-muertos",
    name: "Día de Muertos en el Panteón",
    category: "Cultura",
    era: "1-2 noviembre",
    short: "Velación cornish-mexicana única.",
    story:
      "Las familias decoran las tumbas inglesas y mexicanas por igual. Cempasúchil, gaitas escocesas y calaveritas literarias. La fusión más bella del país.",
    image: rdmDiaMuertos,
    lat: 20.1428,
    lng: -98.6762,
    tags: ["tradición viva"],
    rating: 5.0,
  },
];

export const RDM_MAP_CENTER = { lat: 20.1384, lng: -98.6735, zoom: 15 } as const;

export const RDM_COORDINATE_BOUNDS = {
  north: 20.17,
  south: 20.11,
  east: -98.64,
  west: -98.7,
} as const;

export const validateRdmPoiCoordinates = (poi: Pick<RdmPoi, "lat" | "lng">) =>
  poi.lat >= RDM_COORDINATE_BOUNDS.south &&
  poi.lat <= RDM_COORDINATE_BOUNDS.north &&
  poi.lng >= RDM_COORDINATE_BOUNDS.west &&
  poi.lng <= RDM_COORDINATE_BOUNDS.east;

export const CATEGORY_META: Record<RdmCategory, { color: string; emoji: string; label: string }> = {
  Historia: { color: "#D4A03C", emoji: "⛏️", label: "Historia" },
  Cultura: { color: "#3B82F6", emoji: "🎭", label: "Cultura" },
  Gastronomía: { color: "#F97316", emoji: "🥟", label: "Gastronomía" },
  Ecoturismo: { color: "#22C55E", emoji: "🌲", label: "Ecoturismo" },
  Patrimonio: { color: "#A855F7", emoji: "🏛️", label: "Patrimonio" },
  Religioso: { color: "#EC4899", emoji: "⛪", label: "Religioso" },
  Aventura: { color: "#EF4444", emoji: "🧗", label: "Aventura" },
  Leyenda: { color: "#8B5CF6", emoji: "👻", label: "Leyenda" },
};

export const RDM_LEGENDS = RDM_POIS.filter((p) => p.category === "Leyenda" || p.tags?.includes("leyenda"));
export const RDM_GASTRO = RDM_POIS.filter((p) => p.category === "Gastronomía");
export const RDM_HISTORY = RDM_POIS.filter((p) => p.category === "Historia" || p.category === "Patrimonio");
