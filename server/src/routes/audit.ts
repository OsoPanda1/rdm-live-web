import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import { listAuditFeed } from "../services/audit.service.js";
import {
  attachAuditEvidence,
  type AuditLevel,
  evaluateFreezeReadiness,
  listAuditChecklist,
  requestFreezeDecision,
} from "../services/audit-workbench.service.js";
import type { AuthenticatedRequest } from "../types/auth.js";

const auditRouter = Router();

const checklistQuerySchema = z.object({
  level: z.coerce.number().int().min(1).max(6).optional(),
  priority: z.enum(["P0", "P1", "P2", "P3"]).optional(),
  status: z
    .enum(["pending", "in_review", "blocked", "approved", "requires_remediation"])
    .optional(),
});

const evidenceSchema = z.object({
  itemId: z.string().min(2),
  status: z.enum(["pending", "in_review", "blocked", "approved", "requires_remediation"]),
  command: z.string().min(2).optional(),
  result: z.enum(["pass", "warning", "fail"]).optional(),
  notes: z.string().min(3),
  sourceUrl: z.string().url().optional(),
});

auditRouter.get("/feed", (_req, res) => {
  return res.json(listAuditFeed());
});

auditRouter.get("/checklist", (req, res) => {
  const parsed = checklistQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  return res.json({
    items: listAuditChecklist({
      ...parsed.data,
      level: parsed.data.level as AuditLevel | undefined,
    }),
  });
});

auditRouter.post("/evidence", requireAuth, (req: AuthenticatedRequest, res) => {
  if (!req.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const parsed = evidenceSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  try {
    const evidence = attachAuditEvidence({ ...parsed.data, actorId: req.user.id });
    return res.status(201).json({ evidence });
  } catch (error) {
    return res.status(404).json({ error: (error as Error).message });
  }
});

auditRouter.get("/freeze/readiness", (_req, res) => {
  return res.json({ readiness: evaluateFreezeReadiness() });
});

auditRouter.post("/freeze/decision", requireAuth, (req: AuthenticatedRequest, res) => {
  if (!req.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  return res.status(201).json({ decision: requestFreezeDecision(req.user.id) });
});

export default auditRouter;
