import { Router } from "express";
import { z } from "zod";
import { recommendBusinesses } from "../services/recommendations.service.js";

const recommendationSchema = z.object({
  intent: z.string().min(2),
});

const recommendationsRouter = Router();

recommendationsRouter.post("/", (req, res) => {
  const parsed = recommendationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const businesses = recommendBusinesses(parsed.data);
  return res.json({ businesses });
});

export default recommendationsRouter;
