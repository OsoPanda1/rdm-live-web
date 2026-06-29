import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import type { AuthenticatedRequest } from "../types/auth.js";
import { createLedgerEntry, getEconomySummary, setMembership } from "../services/economy.service.js";

const membershipSchema = z.object({ tier: z.enum(["free", "creator", "guardian", "institutional"]) });
const ledgerSchema = z.object({ kind: z.enum(["credit", "debit"]), amount: z.number().positive(), reason: z.string().min(2) });

const economyRouter = Router();

economyRouter.get("/me", requireAuth, (req: AuthenticatedRequest, res) => {
  if (!req.user?.id) return res.status(401).json({ error: "Unauthorized" });
  return res.json(getEconomySummary(req.user.id));
});

economyRouter.post("/membership", requireAuth, (req: AuthenticatedRequest, res) => {
  if (!req.user?.id) return res.status(401).json({ error: "Unauthorized" });
  const parsed = membershipSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  return res.json({ membership: setMembership({ userId: req.user.id, tier: parsed.data.tier }) });
});

economyRouter.post("/ledger", requireAuth, (req: AuthenticatedRequest, res) => {
  if (!req.user?.id) return res.status(401).json({ error: "Unauthorized" });
  const parsed = ledgerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  return res.status(201).json(createLedgerEntry({ userId: req.user.id, ...parsed.data }));
});

export default economyRouter;
