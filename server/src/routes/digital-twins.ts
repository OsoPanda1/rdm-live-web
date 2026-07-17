import { Router } from "express";
import { z } from "zod";
import { db } from "../lib/store.js";
import {
  ensureBusinessTwin,
  listTwinInstances,
  listTwinModels,
  simulateTwinScenario,
} from "../services/digital-twins.service.js";

const createTwinSchema = z.object({
  businessId: z.string().min(1),
});

const simulateSchema = z.object({
  twinId: z.string().min(1),
  weather: z.enum(["clear", "rain", "fog"]),
  projectedVisitors: z.number().int().min(0).max(10000),
});

const digitalTwinsRouter = Router();

digitalTwinsRouter.get("/models", (_req, res) => {
  return res.json({ models: listTwinModels() });
});

digitalTwinsRouter.get("/instances", (_req, res) => {
  return res.json({ twins: listTwinInstances() });
});

digitalTwinsRouter.post("/instances", (req, res) => {
  const parsed = createTwinSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const business = db.businesses.get(parsed.data.businessId);
  if (!business) {
    return res.status(404).json({ error: "Business not found" });
  }

  const twin = ensureBusinessTwin(business);
  return res.status(201).json({ twin });
});

digitalTwinsRouter.post("/simulate", (req, res) => {
  const parsed = simulateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const twin = simulateTwinScenario(parsed.data);
  if (!twin) {
    return res.status(404).json({ error: "Twin not found" });
  }

  return res.json({ twin });
});

export default digitalTwinsRouter;
