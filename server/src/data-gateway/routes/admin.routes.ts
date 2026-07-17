import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import type { AuthenticatedRequest } from "../../types/auth.js";
import { playerService } from "../gamification/player.service.js";
import { missionService } from "../gamification/mission.service.js";
import { journalService } from "../services/journal.service.js";
import { auditService } from "../services/audit.service.js";
import { cacheService } from "../services/cache.service.js";

const router = Router();

router.use(requireAuth, requireRole("ADMIN"));

router.get("/players", async (_req: AuthenticatedRequest, res) => {
  try {
    const players = await playerService.findAll();
    return res.json({ data: players, total: players.length });
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : "Admin error" });
  }
});

router.get("/players/:id", async (req: AuthenticatedRequest, res) => {
  try {
    const player = await playerService.getById(Number(req.params.id));
    if (!player) return res.status(404).json({ error: "Player not found" });
    return res.json(player);
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : "Admin error" });
  }
});

router.post("/players/:id/xp", async (req: AuthenticatedRequest, res) => {
  try {
    const amount = Number(req.body.amount);
    if (!amount || amount < 0) return res.status(400).json({ error: "Valid amount required" });

    const player = await playerService.addXp(Number(req.params.id), amount);
    if (!player) return res.status(404).json({ error: "Player not found" });
    return res.json(player);
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : "Admin error" });
  }
});

router.get("/journal", async (_req: AuthenticatedRequest, res) => {
  try {
    const pending = await journalService.getPending();
    return res.json({ data: pending, total: pending.length });
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : "Journal error" });
  }
});

router.post("/recovery", async (req: AuthenticatedRequest, res) => {
  try {
    const report = await journalService.generateRecoveryReport({
      environment: (req.body?.environment as string) ?? process.env.NODE_ENV ?? "development",
    });
    return res.json(report);
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : "Recovery error" });
  }
});

router.get("/audit", async (req: AuthenticatedRequest, res) => {
  try {
    const logs = await auditService.query({
      userId: req.query.userId as string | undefined,
      endpoint: req.query.endpoint as string | undefined,
      limit: req.query.limit ? Number(req.query.limit) : 200,
    });
    return res.json({ data: logs, total: logs.length });
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : "Audit error" });
  }
});

router.get("/cache", async (_req: AuthenticatedRequest, res) => {
  return res.json({ size: cacheService.size() });
});

router.delete("/cache", async (_req: AuthenticatedRequest, res) => {
  cacheService.clear();
  return res.json({ cleared: true });
});

export default router;
