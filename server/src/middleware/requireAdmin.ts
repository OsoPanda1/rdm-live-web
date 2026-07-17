import type { NextFunction, Request, Response } from "express";

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as Request & { user?: { role?: string } }).user;
  const adminHeader = req.header("x-admin-token");
  const expectedToken = process.env.ADMIN_TOKEN;

  if (user?.role === "admin" || (expectedToken && adminHeader === expectedToken)) {
    next();
    return;
  }

  res.status(403).json({ ok: false, error: { code: "forbidden", message: "Admin access required" } });
}
