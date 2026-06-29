import { Router } from "express";
import { z } from "zod";
import { db } from "../lib/store.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import type { AuthenticatedRequest } from "../types/auth.js";

const createBusinessSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  category: z.string().min(2),
  latitude: z.number(),
  longitude: z.number(),
  address: z.string().optional(),
});

const businessesRouter = Router();

businessesRouter.get("/", (_req, res) => {
  const data = [...db.businesses.values()].filter((business) => business.isActive);
  return res.json(data);
});

businessesRouter.post("/", requireAuth, requireRole("MERCHANT"), (req: AuthenticatedRequest, res) => {
  const parsed = createBusinessSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const id = crypto.randomUUID();
  const business = {
    id,
    ownerId: userId,
    plan: "basic" as const,
    isActive: true,
    createdAt: new Date().toISOString(),
    ...parsed.data,
  };

  db.businesses.set(id, business);
  return res.status(201).json(business);
});

businessesRouter.get("/me", requireAuth, requireRole("MERCHANT"), (req: AuthenticatedRequest, res) => {
  const current = [...db.businesses.values()].find((business) => business.ownerId === req.user?.id);
  return res.json({ business: current ?? null });
});

export default businessesRouter;
