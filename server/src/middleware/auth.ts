import type { NextFunction, Response } from "express";
import jwt, { type JwtPayload, type Secret, type SignOptions } from "jsonwebtoken";
import { config } from "../config.js";
import type { AuthenticatedRequest, AuthUser } from "../types/auth.js";

interface AuthToken extends JwtPayload {
  sub: string;
  role: AuthUser["role"];
}

const JWT_VERIFY_OPTIONS: jwt.VerifyOptions = {
  algorithms: ["HS256"],
  issuer: config.jwtIssuer,
  audience: config.jwtAudience,
  clockTolerance: 5,
};

const JWT_SIGN_OPTIONS: SignOptions = {
  algorithm: "HS256",
  issuer: config.jwtIssuer,
  audience: config.jwtAudience,
  expiresIn: config.jwtExpiresIn as SignOptions["expiresIn"],
};

export function signAuthToken(user: AuthUser) {
  return jwt.sign({ role: user.role }, config.jwtSecret as Secret, {
    ...JWT_SIGN_OPTIONS,
    subject: user.id,
    jwtid: crypto.randomUUID(),
  });
}

function isAuthToken(payload: string | JwtPayload): payload is AuthToken {
  return typeof payload !== "string" && typeof payload.sub === "string" && typeof payload.role === "string";
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "TOKEN_REQUIRED" });
  }

  try {
    const payload = jwt.verify(header.slice(7), config.jwtSecret, JWT_VERIFY_OPTIONS);
    if (!isAuthToken(payload)) {
      return res.status(401).json({ error: "INVALID_TOKEN" });
    }

    req.user = { id: payload.sub, role: payload.role };
    return next();
  } catch {
    return res.status(401).json({ error: "INVALID_TOKEN" });
  }
}

export function requireRole(role: AuthUser["role"]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ error: "INSUFFICIENT_ROLE" });
    }
    return next();
  };
}
