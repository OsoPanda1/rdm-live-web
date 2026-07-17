import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { signAuthToken } from "../middleware/auth.js";
import { db } from "../lib/store.js";
import { ensureProfile } from "../services/user.service.js";
import { ensureMembership, ensureTokenBalance } from "../services/economy.service.js";
import { limiters } from "../middleware/rateLimit.js";

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["VISITOR", "MERCHANT"]).optional(),
});

const loginSchema = registerSchema;

const authRouter = Router();

authRouter.post("/register", limiters.auth, async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { email, password, role } = parsed.data;
  if (db.usersByEmail.has(email)) {
    return res.status(409).json({ error: "Email already exists" });
  }

  const id = crypto.randomUUID();
  const passwordHash = await bcrypt.hash(password, 10);

  const normalizedRole = role ?? "VISITOR";
  db.users.set(id, { id, email, passwordHash, role: normalizedRole });
  db.usersByEmail.set(email, id);

  ensureProfile(id);
  ensureMembership(id);
  ensureTokenBalance(id);

  const token = signAuthToken({ id, role: normalizedRole });
  return res.status(201).json({ token, user: { id, email, role: normalizedRole } });
});

authRouter.post("/login", limiters.auth, async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { email, password } = parsed.data;
  const userId = db.usersByEmail.get(email);

  if (!userId) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const user = db.users.get(userId);
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = signAuthToken({ id: user.id, role: user.role });
  return res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
});

authRouter.post("/logout", (_req, res) => {
  return res.json({ ok: true, message: "Logout controlado por cliente (JWT stateless)." });
});

export default authRouter;
