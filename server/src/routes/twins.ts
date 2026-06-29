import { Router } from "express";
import { db } from "../lib/store.js";
import {
  ensureBusinessTwin,
  listTwinInstances,
  listTwinModels,
  simulateTwinScenario,
  computeTwinOperationalScore,
} from "../services/digital-twins.service.js";
import { z } from "zod";

const twinsRouter = Router();

// Seed default twins on first access
let seeded = false;
function seedDefaultTwins() {
  if (seeded) return;
  seeded = true;

  const defaultPlaces = [
    { id: "twin-centro", name: "Centro Histórico", category: "cultura", isActive: true },
    { id: "twin-mina-acosta", name: "Mina de Acosta", category: "cultura", isActive: true },
    { id: "twin-panteon", name: "Panteón Inglés", category: "cultura", isActive: true },
    { id: "twin-cristo-rey", name: "Cristo Rey", category: "ecoturismo", isActive: true },
    { id: "twin-pasteria", name: "Pastería El Portal", category: "gastronomia", isActive: true },
  ];

  defaultPlaces.forEach((place) => {
    if (!db.businesses.has(place.id)) {
      db.businesses.set(place.id, {
        id: place.id,
        ownerId: "system",
        name: place.name,
        description: `Gemelo digital de ${place.name}`,
        category: place.category,
        latitude: 20.14,
        longitude: -98.67,
        plan: "premium",
        isActive: place.isActive,
        createdAt: new Date().toISOString(),
      });
    }
    const biz = db.businesses.get(place.id)!;
    ensureBusinessTwin(biz);
  });
}

twinsRouter.get("/models", (_req, res) => {
  return res.json({ models: listTwinModels() });
});

twinsRouter.get("/", (_req, res) => {
  seedDefaultTwins();
  const twins = listTwinInstances();
  const enriched = twins.map((twin) => ({
    ...twin,
    operationalScore: computeTwinOperationalScore(twin),
  }));
  return res.json(enriched);
});

twinsRouter.get("/:id", (req, res) => {
  seedDefaultTwins();
  const twin = db.digitalTwins.get(req.params.id);
  if (!twin) return res.status(404).json({ error: "Twin no encontrado." });
  return res.json({
    ...twin,
    operationalScore: computeTwinOperationalScore(twin),
  });
});

const simulateSchema = z.object({
  twinId: z.string().min(1),
  weather: z.enum(["clear", "rain", "fog"]),
  projectedVisitors: z.number().int().min(0).max(10000),
});

twinsRouter.post("/simulate", (req, res) => {
  seedDefaultTwins();
  const parsed = simulateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const twin = simulateTwinScenario(parsed.data);
  if (!twin) return res.status(404).json({ error: "Twin no encontrado." });
  return res.json({ twin });
});

export default twinsRouter;
