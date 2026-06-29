import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { config } from "../config.js";

const systemRouter = Router();
const prisma = config.databaseUrl ? new PrismaClient() : null;

const withTimeout = async <T>(promise: Promise<T>, timeoutMs: number) => {
  return await Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error(`Timeout after ${timeoutMs}ms`)), timeoutMs);
    }),
  ]);
};

async function getDatabaseStatus() {
  if (!prisma) {
    return { ok: false, reason: "DATABASE_URL_NOT_CONFIGURED" };
  }

  try {
    await withTimeout(prisma.$queryRaw`SELECT 1`, 1500);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      reason: "DATABASE_UNREACHABLE",
      details: error instanceof Error ? error.message : "unknown",
    };
  }
}

systemRouter.get("/health", async (_req, res) => {
  const db = await getDatabaseStatus();
  return res.json({
    ok: true,
    service: "rdmx-api",
    uptimeSec: Math.round(process.uptime()),
    checks: { db },
  });
});

systemRouter.get("/ready", async (_req, res) => {
  const db = await getDatabaseStatus();
  if (!db.ok) {
    return res.status(503).json({
      ok: false,
      code: "NOT_READY",
      checks: { db },
    });
  }

  return res.json({ ok: true, checks: { db } });
});

systemRouter.get("/master-report", (_req, res) => {
  return res.json({
    platform: "RDM Digital / TAMV DM-X4",
    generatedAt: new Date().toISOString(),
    architecture: {
      layers: ["L0", "L1", "L2", "L3", "L4", "L5", "L6", "L7"],
      coreModules: [
        "auth",
        "users",
        "profiles",
        "social",
        "streams",
        "protocols",
        "xr",
        "economy",
        "geolocation",
      ],
      realtime: ["/api/geolocation/telemetry/stream", "/api/xr/gateway/stream"],
    },
    status: {
      geolocationMvp: "active",
      protocolOrchestrator: "active",
      xrGateway: "active",
      dbReady: Boolean(config.databaseUrl),
    },
    roadmap: [
      { phase: "db-prisma", targetDays: 3, priority: "P1" },
      { phase: "auth-hardening-refresh-token", targetDays: 2, priority: "P1" },
      { phase: "stripe-subscription-flow", targetDays: 2, priority: "P1" },
      { phase: "realito-contextual-memory", targetDays: 4, priority: "P2" },
      { phase: "offline-pwa-sync", targetDays: 5, priority: "P2" },
    ],
  });
});

export default systemRouter;
