// ================================================================
// RDM Digital OS v3 — Experience Planning API
// ================================================================

import { Router } from "express";
import { z } from "zod";
import { optimizeRoute } from "../experience/geneticOptimizer.js";
import { buildTwinsContext, getTwinById, getTwinsByType } from "../experience/twinContextBuilder.js";
import { buildPlanoIMapCatalog } from "../data/plano-i-atlas.js";
import { normalizePagination, paginate } from "../services/paginated-content.js";
import type { UserPreferences } from "../experience/types.js";
import { config } from "../config.js";
import { createRateLimiter } from "../middleware/rateLimit.js";
import { sendError } from "../middleware/http.js";

const experienceRouter = Router();

experienceRouter.use("/plan", createRateLimiter(config.rateLimitMaxRequests, config.rateLimitWindowMs));

const mapCatalogQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(60).optional(),
  q: z.string().trim().max(120).optional(),
  category: z.enum(["place", "merchant"]).optional(),
  placeType: z.string().trim().max(40).optional(),
  topic: z.enum(["history", "myths", "gastronomy", "routes"]).optional(),
  openOnly: z.coerce.boolean().optional(),
});

const planSchema = z.object({
  availableMinutes: z.number().int().min(30).max(720).optional().default(180),
  intensity: z.enum(["LOW", "MEDIUM", "HIGH"]).optional().default("MEDIUM"),
  interests: z.array(z.string()).optional().default([]),
  withChildren: z.boolean().optional().default(false),
  mobilityConstraints: z.boolean().optional().default(false),
  maxCrowdLevel: z.number().min(0).max(1).optional().default(0.85),
  favoriteType: z.string().optional(),
});

// POST /api/experience/plan — Generate optimized route
experienceRouter.post("/plan", async (req, res, next) => {
  try {
    const parsed = planSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendError(res, 400, "VALIDATION_ERROR", "Invalid experience plan payload", parsed.error.flatten());
    }

    const prefs: UserPreferences = {
      availableMinutes: parsed.data.availableMinutes,
      intensity: parsed.data.intensity,
      interests: parsed.data.interests,
      withChildren: parsed.data.withChildren,
      mobilityConstraints: parsed.data.mobilityConstraints,
      maxCrowdLevel: parsed.data.maxCrowdLevel,
      favoriteType: parsed.data.favoriteType,
    };

    const twinsContext = buildTwinsContext();
    const route = await optimizeRoute(prefs, twinsContext);

    return res.json(route);
  } catch (err) {
    next(err);
  }
});


// GET /api/experience/map-catalog — Plano I map nodes with atlas/twin catalog windows
experienceRouter.get("/map-catalog", (req, res) => {
  const parsed = mapCatalogQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return sendError(res, 400, "VALIDATION_ERROR", "Invalid map catalog query", parsed.error.flatten());
  }

  const { page, pageSize, q } = normalizePagination(parsed.data, 60);
  const typeFilter = parsed.data.placeType?.toUpperCase();
  const query = q.toLowerCase();

  const nodes = buildPlanoIMapCatalog().filter((node) => {
    if (parsed.data.category && node.category !== parsed.data.category) return false;
    if (typeFilter && node.placeType !== typeFilter) return false;
    if (parsed.data.topic && !node.atlasTopics.includes(parsed.data.topic)) return false;
    if (parsed.data.openOnly && node.telemetry.openStatus === false) return false;
    if (!query) return true;
    return [
      node.name,
      node.description,
      node.placeType,
      node.category,
      ...(node.tags ?? []),
      ...node.atlasItems.flatMap((item) => [item.title, item.summary, item.topic]),
    ]
      .join(" ")
      .toLowerCase()
      .includes(query);
  });

  return res.json({ filters: parsed.data, ...paginate(nodes, page, pageSize) });
});

// GET /api/experience/twins — All twins with telemetry
experienceRouter.get("/twins", (_req, res) => {
  const twins = buildTwinsContext();
  return res.json({
    count: twins.length,
    twins,
  });
});

// GET /api/experience/twins/:id — Single twin detail
experienceRouter.get("/twins/:id", (req, res) => {
  const twin = getTwinById(req.params.id);
  if (!twin) {
    return sendError(res, 404, "TWIN_NOT_FOUND", "Twin no encontrado.");
  }
  return res.json(twin);
});

// GET /api/experience/suggestions — Quick pre-computed suggestions
experienceRouter.get("/suggestions", (_req, res) => {
  const twins = buildTwinsContext();

  // Low crowd places
  const quiet = twins
    .filter((t) => t.modelType === "PLACE_TWIN" && (t.telemetry.crowdLevel ?? 0) < 0.3)
    .slice(0, 3)
    .map((t) => ({ id: t.id, name: t.name, crowdLevel: t.telemetry.crowdLevel }));

  // Popular merchants
  const popular = twins
    .filter((t) => t.modelType === "MERCHANT_TWIN")
    .sort((a, b) => b.popularityScore - a.popularityScore)
    .slice(0, 3)
    .map((t) => ({ id: t.id, name: t.name, popularityScore: t.popularityScore }));

  // High immersion
  const immersive = twins
    .filter((t) => t.immersionLevel >= 0.7)
    .slice(0, 3)
    .map((t) => ({ id: t.id, name: t.name, immersionLevel: t.immersionLevel }));

  return res.json({
    quietPlaces: quiet,
    popularMerchants: popular,
    immersiveExperiences: immersive,
    totalNodes: twins.length,
  });
});

export default experienceRouter;
