import { Router } from "express";
import { z } from "zod";
import { listPlanoIAtlasItems } from "../data/plano-i-atlas.js";
import { listTourismEvents, listTourismRoutes } from "../services/content.service.js";
import { normalizePagination, paginate } from "../services/paginated-content.js";
import { sendError } from "../middleware/http.js";

const contentRouter = Router();

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(50).optional(),
  q: z.string().trim().max(120).optional(),
  topic: z.enum(["history", "myths", "gastronomy", "routes"]).optional(),
});

function textMatches(item: { title?: string; summary?: string; body?: string; tags?: string[] }, q: string) {
  if (!q) return true;
  return [item.title, item.summary, item.body, ...(item.tags ?? [])].filter(Boolean).join(" ").toLowerCase().includes(q);
}

contentRouter.get("/routes", (req, res) => {
  const parsed = listQuerySchema.omit({ topic: true }).safeParse(req.query);
  if (!parsed.success) return sendError(res, 400, "VALIDATION_ERROR", "Invalid routes query", parsed.error.flatten());
  const { page, pageSize, q } = normalizePagination(parsed.data);
  const routes = listTourismRoutes().filter((route) => textMatches({ ...route, body: route.points.join(" ") }, q));
  return res.json({ routes, ...paginate(routes, page, pageSize) });
});

contentRouter.get("/events", (req, res) => {
  const parsed = listQuerySchema.omit({ topic: true }).safeParse(req.query);
  if (!parsed.success) return sendError(res, 400, "VALIDATION_ERROR", "Invalid events query", parsed.error.flatten());
  const { page, pageSize, q } = normalizePagination(parsed.data);
  const events = listTourismEvents().filter((event) => textMatches({ title: event.title, summary: event.description, body: event.location }, q));
  return res.json({ events, ...paginate(events, page, pageSize) });
});

contentRouter.get("/plano-i", (req, res) => {
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) return sendError(res, 400, "VALIDATION_ERROR", "Invalid Plano I query", parsed.error.flatten());
  const { page, pageSize, q } = normalizePagination(parsed.data);
  const items = listPlanoIAtlasItems().filter((item) => (!parsed.data.topic || item.topic === parsed.data.topic) && textMatches(item, q));
  return res.json({ topic: parsed.data.topic ?? "all", ...paginate(items, page, pageSize) });
});

export default contentRouter;
