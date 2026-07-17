import { Router } from "express";
import { listAuditFeed } from "../services/audit.service.js";

const auditRouter = Router();

auditRouter.get("/feed", (_req, res) => {
  return res.json(listAuditFeed());
});

export default auditRouter;
