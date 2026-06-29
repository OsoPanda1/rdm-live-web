import type { TwinContext } from "../experience/types.js";
import { buildTwinsContext } from "../experience/twinContextBuilder.js";

export type PlanoITopic = "history" | "myths" | "gastronomy" | "routes";
export type PlanoIPlaceType =
  | "HISTORIC"
  | "MUSEUM"
  | "MINE"
  | "RELIGIOUS"
  | "VIEWPOINT"
  | "NATURE"
  | "FOOD"
  | "LODGING"
  | "HANDCRAFTS"
  | "ACTIVITY"
  | "BAR"
  | "CULTURE";

export interface PlanoIAtlasItem {
  id: string;
  topic: PlanoITopic;
  title: string;
  summary: string;
  body: string;
  tags: string[];
  placeType?: PlanoIPlaceType;
  placeId?: string;
  imageUrl?: string;
  routePoints?: string[];
  sourceTwinIds: string[];
}

const importedImages: Record<string, string> = {
  "centro-historico": "/assets/imported/plaza-night.jpg",
  "mina-de-acosta": "/assets/imported/mina-acosta.webp",
  "panteon-ingles": "/assets/imported/panteon-ingles.webp",
  "bosque-pinos": "/assets/imported/rdm-bosque-niebla.jpg",
  "cristo-rey": "/assets/imported/misty-mountains.jpg",
  "pasteria-portal": "/assets/imported/paste.webp",
  "los-portales": "/assets/imported/calles-colonial.webp",
};

export function imageForTwin(twin: TwinContext) {
  return importedImages[twin.sourceId] ?? "/assets/imported/rdm-aerial-pueblo.jpg";
}

const atlasItems: readonly PlanoIAtlasItem[] = [
  {
    id: "historia-vetas-plata",
    topic: "history",
    title: "Vetas de plata y memoria minera",
    summary: "La minería articuló el territorio, los barrios, los oficios y el carácter comunitario de Real del Monte.",
    body: "Desde las primeras explotaciones coloniales hasta la modernización del siglo XIX, el pueblo creció alrededor de bocaminas, haciendas de beneficio, portales comerciales y caminos de arriería. El atlas conecta estos hechos con los gemelos de Mina de Acosta, Mina de Dolores y Centro Histórico.",
    tags: ["minería", "plata", "patrimonio", "historia"],
    placeType: "MINE",
    placeId: "mina-de-acosta",
    imageUrl: importedImages["mina-de-acosta"],
    sourceTwinIds: ["twin-mina-acosta", "twin-mina-dolores", "twin-centro-historico"],
  },
  {
    id: "historia-cornwall-pastes-futbol",
    topic: "history",
    title: "Cornwall en la montaña hidalguense",
    summary: "La migración cornish trajo tecnología minera, costumbres, fútbol, panteones victorianos y la receta base del paste.",
    body: "El Plano I importa esta capa cultural desde los gemelos de Panteón Inglés, Centro Histórico y Pastería El Portal para narrar una identidad híbrida: minera, británica e hidalguense.",
    tags: ["cornwall", "pastes", "panteón inglés", "fútbol"],
    placeType: "HISTORIC",
    placeId: "panteon-ingles",
    imageUrl: importedImages["panteon-ingles"],
    sourceTwinIds: ["twin-panteon-ingles", "twin-pasteria-portal", "twin-centro-historico"],
  },
  {
    id: "mito-dama-mina",
    topic: "myths",
    title: "La Dama de la Mina",
    summary: "Relato oral sobre una presencia protectora que guía a quienes se pierden en los túneles.",
    body: "En noches de neblina, las voces de barreteros hablan de una figura blanca en galerías antiguas. El sistema la vincula a recorridos interpretativos de Mina de Acosta y a ventanas narrativas de baja luz.",
    tags: ["leyenda", "mina", "niebla", "barreteros"],
    placeType: "MUSEUM",
    placeId: "mina-de-acosta",
    imageUrl: "/assets/imported/mine-tunnel.jpg",
    sourceTwinIds: ["twin-mina-acosta"],
  },
  {
    id: "mito-panteon-ingles",
    topic: "myths",
    title: "El guardián del Panteón Inglés",
    summary: "Una figura victoriana recorre las tumbas cuando la niebla baja desde el bosque.",
    body: "La ventana narrativa del panteón activa contexto histórico y leyenda: tumbas orientadas a Inglaterra, memoria migrante y recorridos nocturnos regulados por aforo.",
    tags: ["leyenda", "panteón", "fantasma", "victoriano"],
    placeType: "HISTORIC",
    placeId: "panteon-ingles",
    imageUrl: importedImages["panteon-ingles"],
    sourceTwinIds: ["twin-panteon-ingles"],
  },
  {
    id: "gastro-paste-minero",
    topic: "gastronomy",
    title: "Paste minero: alimento de turno largo",
    summary: "El paste local conserva la lógica de comida portable de mina, reinterpretada con rellenos hidalguenses.",
    body: "La categoría gastronomía se alimenta de gemelos FOOD y rutas de baja fricción: pasterías, cafés, portales y ventanas de catálogo con foto real cuando el comercio la publica.",
    tags: ["paste", "gastronomía", "cornish", "comercio local"],
    placeType: "FOOD",
    placeId: "pasteria-portal",
    imageUrl: importedImages["pasteria-portal"],
    sourceTwinIds: ["twin-pasteria-portal", "twin-mina-coffee", "twin-los-portales"],
  },
  {
    id: "gastro-cafe-altura",
    topic: "gastronomy",
    title: "Café de altura y sobremesa de niebla",
    summary: "Cafeterías y restaurantes operan como nodos de descanso dentro de rutas patrimoniales.",
    body: "El atlas/twin combina aforo, permanencia promedio y proximidad al centro para sugerir pausas sin saturar corredores turísticos.",
    tags: ["café", "descanso", "sobremesa", "rutas"],
    placeType: "FOOD",
    placeId: "mina-coffee",
    imageUrl: "/assets/imported/rooftops-sunrise.jpg",
    sourceTwinIds: ["twin-mina-coffee", "twin-casa-tacos"],
  },
  {
    id: "ruta-patrimonio-minero-plano-i",
    topic: "routes",
    title: "Ruta patrimonial de bocamina a plaza",
    summary: "Recorrido de 2 a 3 horas que une Mina de Acosta, Centro Histórico y Panteón Inglés.",
    body: "La ruta balancea inmersión L2/L3, aforo bajo y narrativas de patrimonio. Puede paginarse por paradas para experiencias de medio día.",
    tags: ["ruta", "patrimonio", "historia", "mina"],
    placeType: "MINE",
    placeId: "mina-de-acosta",
    imageUrl: importedImages["centro-historico"],
    routePoints: ["Mina de Acosta", "Centro Histórico", "Panteón Inglés"],
    sourceTwinIds: ["twin-mina-acosta", "twin-centro-historico", "twin-panteon-ingles"],
  },
  {
    id: "ruta-niebla-miradores",
    topic: "routes",
    title: "Ruta de niebla, bosque y miradores",
    summary: "Circuito natural por Cristo Rey, Bosque de Pinos y miradores de atardecer.",
    body: "Se priorizan nodos con bajo crowdLevel, alta ventilación natural y ventanas de foto progresiva para no bloquear la visualización móvil.",
    tags: ["ruta", "naturaleza", "mirador", "fotografía"],
    placeType: "NATURE",
    placeId: "bosque-pinos",
    imageUrl: importedImages["bosque-pinos"],
    routePoints: ["Cristo Rey", "Bosque de Pinos", "Mirador del Atardecer"],
    sourceTwinIds: ["twin-cristo-rey", "twin-bosque-pinos", "twin-mirador-atardecer"],
  },
] as const;

export function listPlanoIAtlasItems() {
  return atlasItems;
}

export function buildPlanoIMapCatalog() {
  const atlasByTwin = new Map<string, PlanoIAtlasItem[]>();
  atlasItems.forEach((item) => item.sourceTwinIds.forEach((id) => atlasByTwin.set(id, [...(atlasByTwin.get(id) ?? []), item])));

  return buildTwinsContext().map((twin) => {
    const related = atlasByTwin.get(twin.id) ?? [];
    const type = String(twin.properties.type ?? "CULTURE").toUpperCase() as PlanoIPlaceType;
    return {
      ...twin,
      category: twin.modelType === "MERCHANT_TWIN" ? "merchant" : "place",
      placeType: type,
      imageUrl: related[0]?.imageUrl ?? imageForTwin(twin),
      description: related[0]?.summary ?? String(twin.properties.narrative ?? "Nodo territorial activo del gemelo digital RDM."),
      atlasTopics: [...new Set(related.map((item) => item.topic))],
      atlasItems: related.map((item) => ({ id: item.id, topic: item.topic, title: item.title, summary: item.summary })),
    };
  });
}
