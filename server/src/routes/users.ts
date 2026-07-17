import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { listUsers } from "../services/user.service.js";

const usersRouter = Router();

usersRouter.get("/", requireAuth, requireRole("ADMIN"), (_req, res) => {
  return res.json({ users: listUsers() });
});

export default usersRouter;
