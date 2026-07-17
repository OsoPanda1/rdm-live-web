import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import type { AuthenticatedRequest } from "../../types/auth.js";
import { playerService } from "../gamification/player.service.js";
import { missionService } from "../gamification/mission.service.js";
import { guardianService } from "../gamification/guardian.service.js";
import { journalService } from "../services/journal.service.js";

const router = Router();

router.get("/player", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const supabaseUserId = req.query.supabaseUserId as string ?? req.user?.id;
    if (!supabaseUserId) return res.status(400).json({ error: "supabaseUserId required" });

    const player = await playerService.getOrCreate(supabaseUserId, req.query.displayName as string);
    return res.json(player);
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : "Player error" });
  }
});

router.get("/player/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const player = await playerService.getById(Number(req.params.id));
    if (!player) return res.status(404).json({ error: "Player not found" });
    return res.json(player);
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : "Player error" });
  }
});

router.get("/missions", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const context = req.query.context as string | undefined;
    const allowed = ["turismo", "comercio", "emociones", "xr"];
    const missions = await missionService.getAvailable(
      context && allowed.includes(context) ? context as any : undefined
    );
    return res.json({ data: missions, total: missions.length });
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : "Missions error" });
  }
});

router.post("/missions/:id/start", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const playerId = Number(req.body.playerId);
    const missionId = Number(req.params.id);
    if (!playerId) return res.status(400).json({ error: "playerId required" });

    const log = await missionService.startMission(playerId, missionId);
    if (!log) return res.status(404).json({ error: "Mission not found" });
    return res.json(log);
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : "Mission error" });
  }
});

router.post("/missions/:id/progress", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const playerId = Number(req.body.playerId);
    const missionId = Number(req.params.id);
    const progress = Number(req.body.progress ?? 0);
    if (!playerId) return res.status(400).json({ error: "playerId required" });

    const log = await missionService.updateProgress(playerId, missionId, progress);
    if (!log) return res.status(404).json({ error: "Mission not found" });
    return res.json(log);
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : "Progress error" });
  }
});

router.post("/missions/:id/complete", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const playerId = Number(req.body.playerId);
    const missionId = Number(req.params.id);
    if (!playerId) return res.status(400).json({ error: "playerId required" });

    const result = await missionService.completeMission(playerId, missionId);
    if (!result) return res.status(400).json({ error: "Cannot complete mission" });

    const supabaseUserId = req.user?.id;
    if (supabaseUserId) {
      await journalService.write({
        operationType: "mission_complete",
        entityType: "gamificationQuestLog",
        entityId: String(missionId),
        payload: { missionCode: result.mission.code, xpGained: result.xpGained, virtueGained: result.virtueGained },
        idempotencyKey: `mission_${playerId}_${missionId}`,
        supabaseUserId,
      });
    }

    return res.json(result);
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : "Completion error" });
  }
});

router.get("/quests", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const playerId = Number(req.query.playerId);
    if (!playerId) return res.status(400).json({ error: "playerId required" });

    const quests = await missionService.getPlayerQuests(playerId);
    return res.json({ data: quests, total: quests.length });
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : "Quests error" });
  }
});

router.post("/guardian/assign", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const playerId = Number(req.body.playerId);
    if (!playerId) return res.status(400).json({ error: "playerId required" });

    const result = await guardianService.assignGuardian(playerId);
    if (!result) return res.status(404).json({ error: "Player not found" });
    return res.json(result);
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : "Guardian error" });
  }
});

router.get("/guardians", requireAuth, async (_req: AuthenticatedRequest, res) => {
  try {
    const guardians = await playerService.getGuardians();
    return res.json({ data: guardians, total: guardians.length });
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : "Guardians error" });
  }
});

router.get("/rewards", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const playerId = Number(req.query.playerId);
    if (!playerId) return res.status(400).json({ error: "playerId required" });

    const rewards = await guardianService.getRewards(playerId);
    return res.json({ data: rewards, total: rewards.length });
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : "Rewards error" });
  }
});

export default router;
