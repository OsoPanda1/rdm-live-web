import { Router } from "express";
import { randomUUID } from "node:crypto";
import { gateway } from "../gateway.js";
import { auditService } from "../services/audit.service.js";
import { journalService } from "../services/journal.service.js";
import { cacheService } from "../services/cache.service.js";
import { requireAuth } from "../../middleware/auth.js";
import type { AuthenticatedRequest } from "../../types/auth.js";

const router = Router();

function buildContext(req: AuthenticatedRequest) {
  return {
    requestId: (req.id as string) ?? randomUUID(),
    userId: req.user?.id,
    role: req.user?.role,
    sourceIp: req.ip,
  };
}

router.get("/health", async (_req, res) => {
  return res.json({
    ok: true,
    service: "yun-data-gateway",
    cacheSize: cacheService.size(),
    config: gateway.getConfig(),
  });
});

router.get("/audit/logs", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const logs = await auditService.query({
      userId: req.query.userId as string | undefined,
      endpoint: req.query.endpoint as string | undefined,
      limit: req.query.limit ? Number(req.query.limit) : 100,
    });
    return res.json({ data: logs, total: logs.length });
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : "Audit error" });
  }
});

router.get("/journal/pending", requireAuth, async (_req: AuthenticatedRequest, res) => {
  try {
    const pending = await journalService.getPending();
    return res.json({ data: pending, total: pending.length });
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : "Journal error" });
  }
});

router.post("/recovery/report", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const report = await journalService.generateRecoveryReport({
      environment: (req.body?.environment as string) ?? process.env.NODE_ENV ?? "development",
    });
    return res.json(report);
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : "Recovery error" });
  }
});

router.get("/cache/status", requireAuth, async (_req: AuthenticatedRequest, res) => {
  return res.json({ size: cacheService.size() });
});

router.delete("/cache", requireAuth, async (_req: AuthenticatedRequest, res) => {
  cacheService.clear();
  return res.json({ cleared: true });
});

router.get("/:entity/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { entity, id } = req.params;
    const result = await gateway.findById(entity, id, buildContext(req));
    if (!result) return res.status(404).json({ error: "Not found" });
    return res.json(result);
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : "Gateway error" });
  }
});

router.get("/:entity", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { entity } = req.params;
    const filters = req.query.filters ? JSON.parse(req.query.filters as string) : undefined;
    const sort = req.query.sort ? JSON.parse(req.query.sort as string) : undefined;
    const options = {
      filters,
      sort,
      limit: req.query.limit ? Number(req.query.limit) : 50,
      offset: req.query.offset ? Number(req.query.offset) : 0,
    };
    const result = await gateway.query(entity, options, buildContext(req));
    return res.json(result);
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : "Gateway error" });
  }
});

router.post("/:entity", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { entity } = req.params;
    const result = await gateway.create(entity, req.body, buildContext(req));
    return res.status(201).json(result);
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : "Gateway error" });
  }
});

router.patch("/:entity/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { entity, id } = req.params;
    const result = await gateway.update(entity, id, req.body, buildContext(req));
    if (!result) return res.status(404).json({ error: "Not found" });
    return res.json(result);
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : "Gateway error" });
  }
});

router.delete("/:entity/:id", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { entity, id } = req.params;
    const result = await gateway.delete(entity, id, buildContext(req));
    if (!result) return res.status(404).json({ error: "Not found" });
    return res.status(204).end();
  } catch (e) {
    return res.status(500).json({ error: e instanceof Error ? e.message : "Gateway error" });
  }
});

export default router;
