// server/src/index.ts
import "dotenv/config";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";
import { randomUUID } from "node:crypto";
import apiRouter from "./routes/index.js";
import { config } from "./config.js";
import { errorHandler, notFoundHandler } from "./middleware/http.js";
import { constitutionalGuard } from "./middleware/constitutionalGuard.js";
import { createHardenedRateLimiter } from "./middleware/rateLimit.js";

// Tipado ligero para requestId en Express
declare module "express-serve-static-core" {
  interface Request {
    id?: string;
    startedAt?: number;
  }
}

export const app = express();

// ============================
// HARDENING BÁSICO DEL SERVER
// ============================

app.disable("x-powered-by");
app.set("trust proxy", 1);

// ============================
// TELEMETRÍA DE REQUEST
// ============================

app.use((req: Request, res: Response, next: NextFunction) => {
  const requestId = randomUUID();
  req.id = requestId;
  req.startedAt = Date.now();

  res.setHeader("X-Request-ID", requestId);

  // Hook de logging mínimo; cámbialo por Pino/Winston si quieres algo más potente
  res.on("finish", () => {
    const durationMs =
      typeof req.startedAt === "number" ? Date.now() - req.startedAt : undefined;

    const entry = {
      ts: new Date().toISOString(),
      level: "info",
      message: "http_request",
      requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs,
      ip: req.ip,
      userAgent: req.get("user-agent") ?? undefined,
    };

     
    console.log(JSON.stringify(entry));
  });

  next();
});

// ============================
// CABECERAS DE SEGURIDAD
// ============================

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Permissions-Policy",
    "geolocation=(self), camera=(), microphone=(), payment=(self)",
  );
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Resource-Policy", "same-site");

  // CSP muy restrictivo para la API; la parte de frontend/HTML se sirve desde otro host
  // El TLS (pre/híbrido/post‑Q) debe configurarse en el proxy (nginx, Vercel, etc.). [web:433][web:436]
  res.setHeader(
    "Content-Security-Policy",
    [
      "default-src 'none'",
      "frame-ancestors 'none'",
      "base-uri 'none'",
      "form-action 'none'",
      "script-src 'none'",
      "style-src 'none'",
      "img-src 'none'",
    ].join("; "),
  );

  next();
});

// ============================
// CORS ENDURECIDO
// ============================

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        // Permitir herramientas tipo curl / localhost sin origin
        return callback(null, true);
      }
      if (config.corsAllowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("CORS origin not allowed"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Authorization",
      "Content-Type",
      "X-Request-ID",
      "X-Real-IP",
      "X-Forwarded-For",
    ],
    exposedHeaders: ["X-Request-ID"],
  }),
);

// ============================
// BODY PARSERS · LIMITES
// ============================

app.use(
  express.json({
    limit: "1mb",
    strict: true,
    // Evitar JSON malformado explotando el parser
    verify: (req, _res, buf) => {
      // Guardar el raw body si luego lo quieres validar (ej. Stripe webhooks)
      (req as any).rawBody = buf.toString("utf8");
    },
  }),
);
app.use(express.urlencoded({ extended: false, limit: "256kb" }));

// ============================
// HEALTHCHECK
// ============================

app.get("/healthz", (req, res) => {
  res.json({
    ok: true,
    service: "rdmx-api",
    requestId: res.getHeader("X-Request-ID"),
    // Podrías añadir más señales aquí: salud de DB, latencias, etc.
  });
});

// ============================
// RATE LIMIT + GUARDAS
// ============================

app.use(
  "/api",
  createHardenedRateLimiter({
    maxRequests: config.rateLimitMaxRequests,
    windowMs: config.rateLimitWindowMs,
    keyPrefix: "global-api",
  }),
  constitutionalGuard,
  apiRouter,
);

// 404 + ERROR HANDLERS
app.use(notFoundHandler);
app.use(errorHandler);

// ============================
// ARRANQUE Y SHUTDOWN ORDENADO
// ============================

export function startServer(port = config.port) {
  const server = app.listen(port, () => {
     
    console.log(
      JSON.stringify({
        ts: new Date().toISOString(),
        level: "info",
        message: "rdm_backend_started",
        port,
      }),
    );
  });

  const shutdown = (signal: NodeJS.Signals) => {
     
    console.log(
      JSON.stringify({
        ts: new Date().toISOString(),
        level: "warn",
        message: "shutdown_signal_received",
        signal,
      }),
    );

    server.close((error) => {
      if (error) {
         
        console.error(
          JSON.stringify({
            ts: new Date().toISOString(),
            level: "error",
            message: "graceful_shutdown_error",
            error: String(error),
          }),
        );
        process.exit(1);
      }

       
      console.log(
        JSON.stringify({
          ts: new Date().toISOString(),
          level: "info",
          message: "rdm_backend_stopped",
        }),
      );
      process.exit(0);
    });
  };

  process.once("SIGTERM", shutdown);
  process.once("SIGINT", shutdown);

  return server;
}

const isEntrypoint = process.argv[1] && process.argv[1].endsWith("index.js");
if (isEntrypoint) {
  startServer();
}
