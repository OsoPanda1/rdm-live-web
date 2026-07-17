import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import type { AuthenticatedRequest } from "../types/auth.js";
import { geolocationService } from "../services/geolocation.service.js";

const registerPlaceSchema = z.object({
  name: z.string().min(3),
  category: z.string().min(2),
  address: z.string().min(5),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  source: z.enum(["gps", "wifi", "beacon", "manual"]).optional(),
});

const verifySchema = z.object({
  name: z.string().min(3),
  category: z.string().min(2),
  address: z.string().min(5),
  lat: z.number(),
  lng: z.number(),
});

const telemetryIngestSchema = z.object({
  userId: z.string().min(1),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  timestamp: z.string().datetime().optional(),
  source: z.enum(["gps", "wifi", "beacon", "manual"]).optional(),
});

const telemetryQuerySchema = z.object({
  userId: z.string().min(1),
  limit: z.coerce.number().int().min(1).max(500).optional(),
});

const geolocationRouter = Router();

const isMerchantOrAdmin = (req: AuthenticatedRequest) =>
  req.user?.role === "MERCHANT" || req.user?.role === "ADMIN";

geolocationRouter.post("/places/register", requireAuth, (req: AuthenticatedRequest, res) => {
  if (!isMerchantOrAdmin(req)) {
    return res.status(403).json({ error: "Role requires MERCHANT or ADMIN" });
  }

  const parsed = registerPlaceSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  try {
    const created = geolocationService.registerPlace(parsed.data);
    return res.status(201).json(created);
  } catch (error) {
    return res.status(400).json({ error: (error as Error).message });
  }
});

geolocationRouter.get("/places", (_req, res) => {
  return res.json({
    items: geolocationService.listPlaces(),
  });
});

geolocationRouter.post("/verify", requireAuth, (req, res) => {
  const parsed = verifySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const verification = geolocationService.verifyLocation(parsed.data);
  return res.json(verification);
});

geolocationRouter.get("/telemetry/recent", requireAuth, (req, res) => {
  const parsed = telemetryQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const telemetry = geolocationService.getRecentTelemetry(parsed.data.userId, parsed.data.limit);
  return res.json({ items: telemetry });
});

geolocationRouter.post("/telemetry/ingest", requireAuth, (req, res) => {
  const parsed = telemetryIngestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  try {
    const telemetry = geolocationService.addTelemetry({
      ...parsed.data,
      timestamp: parsed.data.timestamp ?? new Date().toISOString(),
    });
    return res.status(201).json(telemetry);
  } catch (error) {
    return res.status(400).json({ error: (error as Error).message });
  }
});

geolocationRouter.get("/telemetry/stream", requireAuth, (_req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const dispose = geolocationService.subscribeTelemetry((event) => {
    res.write(`data: ${JSON.stringify(event)}\\n\\n`);
  });

  const keepAlive = setInterval(() => {
    res.write(": heartbeat\\n\\n");
  }, 15_000);

  res.on("close", () => {
    clearInterval(keepAlive);
    dispose();
  });
});

export default geolocationRouter;
