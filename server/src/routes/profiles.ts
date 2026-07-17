import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth.js";
import type { AuthenticatedRequest } from "../types/auth.js";
import { ensureProfile, updateProfile } from "../services/user.service.js";

const updateSchema = z.object({
  displayName: z.string().min(2).optional(),
  bio: z.string().max(280).optional(),
  avatarUrl: z.string().url().optional(),
  interests: z.array(z.string().min(2)).max(12).optional(),
  socialLinks: z.array(z.string().url()).max(8).optional(),
});

const profilesRouter = Router();

profilesRouter.get("/me", requireAuth, (req: AuthenticatedRequest, res) => {
  if (!req.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  return res.json({ profile: ensureProfile(req.user.id) });
});

profilesRouter.patch("/me", requireAuth, (req: AuthenticatedRequest, res) => {
  if (!req.user?.id) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const profile = updateProfile({ userId: req.user.id, ...parsed.data });
  return res.json({ profile });
});

export default profilesRouter;
