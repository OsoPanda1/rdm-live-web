import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import type { AuthenticatedRequest } from "../types/auth.js";
import { createDreamspace, getXrScenePayload, joinDreamspace, listDreamspaces } from "../services/xr.service.js";
import { listRecentXrGatewayEvents, subscribeXrGateway } from "../services/xr.gateway.js";

const createSchema = z.object({ name: z.string().min(3), visibility: z.enum(["public", "private"]), sceneProfile: z.enum(["heritage", "festival", "nature"]) });
const joinSchema = z.object({ dreamspaceId: z.string().min(1) });

const xrRouter = Router();

xrRouter.get("/dreamspaces", (_req, res) => {
  return res.json({ dreamspaces: listDreamspaces() });
});

xrRouter.post("/dreamspaces", requireAuth, (req: AuthenticatedRequest, res) => {
  if (!req.user?.id) return res.status(401).json({ error: "Unauthorized" });
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  return res.status(201).json({ dreamspace: createDreamspace({ ownerId: req.user.id, ...parsed.data }) });
});

xrRouter.post("/dreamspaces/join", requireAuth, (req: AuthenticatedRequest, res) => {
  if (!req.user?.id) return res.status(401).json({ error: "Unauthorized" });
  const parsed = joinSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const dreamspace = joinDreamspace({ dreamspaceId: parsed.data.dreamspaceId, userId: req.user.id });
  if (!dreamspace) return res.status(404).json({ error: "Dreamspace not found" });
  return res.json({ dreamspace });
});

xrRouter.get("/scene/:dreamspaceId", (req, res) => {
  const scene = getXrScenePayload(req.params.dreamspaceId);
  if (!scene) return res.status(404).json({ error: "Dreamspace not found" });
  return res.json({ scene });
});

xrRouter.get("/gateway/events", (_req, res) => {
  return res.json({ events: listRecentXrGatewayEvents() });
});

xrRouter.get("/gateway/stream", requireAuth, (_req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const disposer = subscribeXrGateway((event) => {
    res.write(`data: ${JSON.stringify(event)}\\n\\n`);
  });

  const keepAlive = setInterval(() => {
    res.write(": heartbeat\\n\\n");
  }, 15_000);

  res.on("close", () => {
    clearInterval(keepAlive);
    disposer();
  });
});

export default xrRouter;
