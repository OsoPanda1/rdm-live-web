import { Router } from "express";
import { paginateArray, extractPaginationParams } from "../services/pagination.js";

const placesRouter = Router();

// In-memory places store (seeded data)
const placesData = [
  {
    id: "centro-historico",
    slug: "centro-historico",
    name: "Centro Histórico y Plaza Principal",
    description: "Corazón de Real del Monte, con arquitectura de influencia inglesa y memoria minera viva. Rodeada de portales coloniales del siglo XVIII.",
    type: "HISTORIC",
    tags: ["historia", "centro", "arquitectura", "plaza"],
    location: { lat: 20.1407, lng: -98.6725, alt: 2700 },
    isFeatured: true,
  },
  {
    id: "mina-de-acosta",
    slug: "mina-de-acosta",
    name: "Mina de Acosta",
    description: "Mina histórica convertida en museo con recorridos guiados y túneles originales. Desciende 400m bajo tierra en una experiencia única.",
    type: "MUSEUM",
    tags: ["mina", "museo", "historia", "túneles"],
    location: { lat: 20.1448, lng: -98.6653, alt: 2720 },
    isFeatured: true,
  },
  {
    id: "panteon-ingles",
    slug: "panteon-ingles",
    name: "Panteón Inglés",
    description: "Único cementerio inglés en Latinoamérica con criptas victorianas. Testigo de la presencia británica en la minería del siglo XIX. Tumbas orientadas hacia Inglaterra.",
    type: "HISTORIC",
    tags: ["historia", "británico", "victoriano", "cultural"],
    location: { lat: 20.1397, lng: -98.6769, alt: 2690 },
    isFeatured: true,
  },
  {
    id: "parroquia-asuncion",
    slug: "parroquia-asuncion",
    name: "Parroquia de la Asunción",
    description: "Iglesia colonial del siglo XVIII con retablos barrocos dorados y fachada de cantera rosa que domina la plaza principal.",
    type: "RELIGIOUS",
    tags: ["iglesia", "colonial", "religioso", "barroco"],
    location: { lat: 20.1412, lng: -98.6738, alt: 2700 },
    isFeatured: false,
  },
  {
    id: "museo-medicina",
    slug: "museo-medicina-laboral",
    name: "Museo de Medicina Laboral",
    description: "Documenta las condiciones de salud de los mineros con instrumental médico del siglo XIX y fotografías históricas.",
    type: "MUSEUM",
    tags: ["museo", "medicina", "minería", "historia"],
    location: { lat: 20.1405, lng: -98.6729, alt: 2700 },
    isFeatured: false,
  },
  {
    id: "cristo-rey",
    slug: "cristo-rey",
    name: "Cristo Rey (Peña del Zumate)",
    description: "Monumento icónico en la cima de la peña con vistas panorámicas de 360° del pueblo y las montañas circundantes.",
    type: "VIEWPOINT",
    tags: ["mirador", "panorámica", "monumento", "fotografía"],
    location: { lat: 20.1460, lng: -98.6690, alt: 2780 },
    isFeatured: true,
  },
  {
    id: "mina-dolores",
    slug: "mina-dolores",
    name: "Mina de Dolores",
    description: "Una de las minas más profundas de la región, clave en la historia de la plata novohispana.",
    type: "MINE",
    tags: ["mina", "plata", "historia", "patrimonio"],
    location: { lat: 20.1430, lng: -98.6700, alt: 2730 },
    isFeatured: false,
  },
  {
    id: "bosque-pinos",
    slug: "bosque-pinos",
    name: "Bosque de Pinos y Oyameles",
    description: "Área natural para senderismo a 2,700m de altitud. Bosque de oyamel y pino con aire puro de montaña y senderos marcados.",
    type: "NATURE",
    tags: ["naturaleza", "senderismo", "bosque", "ecoturismo"],
    location: { lat: 20.1556, lng: -98.6856, alt: 2750 },
    isFeatured: false,
  },
  {
    id: "mirador-atardecer",
    slug: "mirador-atardecer",
    name: "Mirador del Atardecer",
    description: "Mejor lugar para ver el atardecer en todo el Valle del Mezquital. Un espectáculo de colores sobre la sierra hidalguense.",
    type: "VIEWPOINT",
    tags: ["mirador", "atardecer", "panorámica", "naturaleza"],
    location: { lat: 20.1489, lng: -98.6711, alt: 2760 },
    isFeatured: false,
  },
  {
    id: "vista-penon",
    slug: "vista-penon",
    name: "Vista del Peñón",
    description: "Panorámica espectacular del pueblo desde lo alto, con vistas que alcanzan el Valle del Mezquital en días claros.",
    type: "VIEWPOINT",
    tags: ["mirador", "vista", "peñón", "fotografía"],
    location: { lat: 20.1511, lng: -98.6694, alt: 2790 },
    isFeatured: false,
  },
];

const toRadians = (value: number) => (value * Math.PI) / 180;
const distanceKm = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const R = 6371;
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(h));
};

placesRouter.get("/", (req, res) => {
  const pagination = extractPaginationParams(req.query as Record<string, unknown>);
  const type = typeof req.query.type === "string" ? req.query.type.toUpperCase() : undefined;
  const tag = typeof req.query.tag === "string" ? req.query.tag.toLowerCase() : undefined;
  const search = typeof req.query.search === "string" ? req.query.search.toLowerCase() : undefined;
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  const radiusKm = Number(req.query.radiusKm ?? 5);

  let result = [...placesData];

  if (type) {
    result = result.filter((place) => place.type === type);
  }

  if (tag) {
    result = result.filter((place) => place.tags.some((entry) => entry.toLowerCase() === tag));
  }

  if (search) {
    result = result.filter(
      (place) =>
        place.name.toLowerCase().includes(search) ||
        place.description.toLowerCase().includes(search),
    );
  }

  if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
    result = result.filter((place) => distanceKm(place.location, { lat, lng }) <= radiusKm);
  }

  const paginated = paginateArray(result, pagination);
  return res.json(paginated);
});

placesRouter.get("/:slug", (req, res) => {
  const place = placesData.find((p) => p.slug === req.params.slug || p.id === req.params.slug);
  if (!place) return res.status(404).json({ error: "Lugar no encontrado." });
  return res.json(place);
});

export default placesRouter;
