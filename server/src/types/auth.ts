import type { Request } from "express";

export interface AuthUser {
  id: string;
  role: "VISITOR" | "MERCHANT" | "ADMIN";
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}
