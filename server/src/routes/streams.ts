import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import type { AuthenticatedRequest } from "../types/auth.js";
import { createStreamRoom, createVideoCallRoom, endStreamRoom, joinVideoCallRoom, listStreams } from "../services/streams.service.js";

const streamSchema = z.object({ title: z.string().min(3) });
const callSchema = z.object({ name: z.string().min(3) });
const joinSchema = z.object({ roomId: z.string().min(1) });

const streamsRouter = Router();

streamsRouter.get("/", (_req, res) => {
  return res.json(listStreams());
});

streamsRouter.post("/live", requireAuth, (req: AuthenticatedRequest, res) => {
  if (!req.user?.id) return res.status(401).json({ error: "Unauthorized" });
  const parsed = streamSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  return res.status(201).json({ stream: createStreamRoom({ hostId: req.user.id, title: parsed.data.title }) });
});

streamsRouter.post("/live/:roomId/end", requireAuth, (req, res) => {
  const roomIdParam = Array.isArray(req.params.roomId) ? req.params.roomId[0] : req.params.roomId;
  const room = endStreamRoom(roomIdParam);
  if (!room) return res.status(404).json({ error: "Room not found" });
  return res.json({ stream: room });
});

streamsRouter.post("/calls", requireAuth, (req: AuthenticatedRequest, res) => {
  if (!req.user?.id) return res.status(401).json({ error: "Unauthorized" });
  const parsed = callSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  return res.status(201).json({ room: createVideoCallRoom({ ownerId: req.user.id, name: parsed.data.name }) });
});

streamsRouter.post("/calls/join", requireAuth, (req: AuthenticatedRequest, res) => {
  if (!req.user?.id) return res.status(401).json({ error: "Unauthorized" });
  const parsed = joinSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const room = joinVideoCallRoom({ roomId: parsed.data.roomId, userId: req.user.id });
  if (!room) return res.status(404).json({ error: "Room unavailable" });
  return res.json({ room });
});

export default streamsRouter;
