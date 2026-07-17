import { Router } from "express";
import { paginateArray, extractPaginationParams } from "../services/pagination.js";

const merchantsRouter = Router();

const merchantsData = [
  {
    id: "pasteria-el-portal",
    slug: "pasteria-el-portal",
    name: "Pastería El Portal",
    category: "FOOD",
    level: "L2",
    isPremium: true,
    immersionLevel: 2,
    description: "Pastes tradicionales con receta córnica frente a la plaza principal. La receta original traída por mineros ingleses en 1824.",
    priceRange: "$$",
    address: "Plaza Principal s/n, Centro",
    location: { lat: 20.1409, lng: -98.6723 },
    phone: "+52 771 123 4567",
    mainImage: "/assets/merchants/pasteria-portal.jpg",
    tags: ["pastes", "tradicional", "centro", "córnica"],
    isActive: true,
  },
  {
    id: "mina-coffee",
    slug: "mina-coffee-house",
    name: "Mina Coffee House",
    category: "FOOD",
    level: "L1",
    isPremium: false,
    immersionLevel: 2,
    description: "Café artesanal y repostería en ambiente colonial. Specialty coffee de altura cultivado en la sierra hidalguense.",
    priceRange: "$$",
    address: "Calle Principal #25",
    location: { lat: 20.1391, lng: -98.6752 },
    phone: "+52 771 123 4567",
    mainImage: null,
    tags: ["café", "repostería", "colonial", "artesanal"],
    isActive: true,
  },
  {
    id: "hotel-real",
    slug: "hotel-real-del-monte",
    name: "Hotel Real del Monte",
    category: "LODGING",
    level: "L3",
    isPremium: true,
    immersionLevel: 3,
    description: "Hotel boutique con vista panorámica. Hospedaje tradicional con amenidades modernas y chimenea en cada habitación.",
    priceRange: "$$$",
    address: "Carretera Federal #10",
    location: { lat: 20.1456, lng: -98.68 },
    phone: "+52 771 234 5678",
    mainImage: null,
    tags: ["hotel", "boutique", "vista panorámica", "chimenea"],
    isActive: true,
  },
  {
    id: "artesanias-rdm",
    slug: "artesanias-rdm",
    name: "Artesanías RDM",
    category: "HANDCRAFTS",
    level: "L1",
    isPremium: false,
    immersionLevel: 1,
    description: "Artesanías locales auténticas: tapetes, cerámica, obsidiana y productos típicos de la región minera.",
    priceRange: "$$",
    address: "Plaza Central #8",
    location: { lat: 20.1385, lng: -98.6755 },
    phone: "+52 771 345 6789",
    mainImage: null,
    tags: ["artesanías", "cerámica", "obsidiana", "tapetes"],
    isActive: true,
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

merchantsRouter.get("/", (req, res) => {
  const pagination = extractPaginationParams(req.query as Record<string, unknown>);
  const category = typeof req.query.category === "string" ? req.query.category.toUpperCase() : undefined;
  const level = typeof req.query.level === "string" ? req.query.level.toUpperCase() : undefined;
  const isPremium = typeof req.query.isPremium === "string" ? req.query.isPremium === "true" : undefined;
  const search = typeof req.query.search === "string" ? req.query.search.toLowerCase() : undefined;
  const lat = Number(req.query.lat);
  const lng = Number(req.query.lng);
  const radiusKm = Number(req.query.radiusKm ?? 5);

  let result = merchantsData.filter((m) => m.isActive);

  if (category) {
    result = result.filter((m) => m.category === category);
  }

  if (level) {
    result = result.filter((m) => m.level === level);
  }

  if (typeof isPremium === "boolean") {
    result = result.filter((m) => m.isPremium === isPremium);
  }

  if (search) {
    result = result.filter(
      (m) =>
        m.name.toLowerCase().includes(search) ||
        m.description.toLowerCase().includes(search) ||
        m.tags.some((t) => t.toLowerCase().includes(search)),
    );
  }

  if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
    result = result.filter((merchant) => distanceKm(merchant.location, { lat, lng }) <= radiusKm);
  }

  const paginated = paginateArray(result, pagination);
  return res.json(paginated);
});

merchantsRouter.get("/:slug", (req, res) => {
  const merchant = merchantsData.find((m) => m.slug === req.params.slug || m.id === req.params.slug);
  if (!merchant) return res.status(404).json({ error: "Comercio no encontrado." });
  return res.json(merchant);
});

export default merchantsRouter;
