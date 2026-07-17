// server/src/routes/donations.ts
import { Router } from "express";
import { z } from "zod";
import Stripe from "stripe";
import crypto from "crypto";
import { config } from "../config.js";
import { db } from "../lib/store.js";

// --- Tipos de telemetría / logging ---

type LogLevel = "info" | "warn" | "error" | "debug";

interface DonationLogPayload {
  requestId: string;
  ip?: string;
  userAgent?: string;
  amount?: number;
  cents?: number;
  provider?: "stripe" | "local";
  status?: "ok" | "validation_error" | "error";
  errorName?: string;
  errorMessage?: string;
  stripeSessionId?: string | null;
  durationMs?: number;
  quantumProfile?: "pre-quantum" | "hybrid-pq" | "post-quantum-ready";
}

// Logger simple; cámbialo por Pino/Winston si ya lo tienes
const emit = (level: LogLevel, message: string, payload?: DonationLogPayload) => {
  const entry = {
    ts: new Date().toISOString(),
    level,
    message,
    context: "donations-checkout",
    ...payload,
  };
  const serialized = JSON.stringify(entry);
  if (level === "error") {
    console.error(serialized);
  } else {
    console.log(serialized);
  }
};

// --- Esquema de validación ---

const checkoutSchema = z.object({
  amount: z.number().min(25), // ahora mínimo 25 MXN
});

// --- Stripe client (pre‑cuántico / TLS clásico) ---

const stripe = config.stripeSecretKey
  ? new Stripe(config.stripeSecretKey, {
      apiVersion: "2023-10-16",
    })
  : null;

// Nota: la parte de seguridad post‑cuántica / híbrida se debe implementar en la capa TLS
// (por ejemplo, Vercel con TLS 1.3 + X25519Kyber768Draft00) y no en el código de Stripe. [web:433][web:436]

const donationsRouter = Router();

donationsRouter.post("/checkout", async (req, res) => {
  const requestId = crypto.randomUUID();
  const startedAt = Date.now();
  const ip = req.ip;
  const userAgent = req.get("user-agent") ?? undefined;

  try {
    const parsed = checkoutSchema.safeParse(req.body);
    if (!parsed.success) {
      emit("warn", "Donation validation failed", {
        requestId,
        ip,
        userAgent,
        status: "validation_error",
        quantumProfile: "hybrid-pq",
      });

      return res.status(400).json({ error: parsed.error.flatten() });
    }

    const amount = parsed.data.amount;
    const cents = Math.round(amount * 100);

    // Protección adicional ante inputs absurdos
    if (!Number.isFinite(cents) || cents <= 0 || cents > 5_000_00) {
      // máx 5,000 MXN, por ejemplo
      emit("warn", "Donation amount out of bounds", {
        requestId,
        ip,
        userAgent,
        amount,
        cents,
        status: "validation_error",
        quantumProfile: "hybrid-pq",
      });
      return res.status(400).json({ error: "Invalid amount range" });
    }

    // Rama sin Stripe (modo local / demo)
    if (!stripe) {
      const id = crypto.randomUUID();

      db.donations.set(id, {
        id,
        amount: cents,
        currency: "mxn",
        providerId: `local_${id}`,
        createdAt: new Date().toISOString(),
      });

      const durationMs = Date.now() - startedAt;
      emit("info", "Donation recorded in local store (no Stripe)", {
        requestId,
        ip,
        userAgent,
        amount,
        cents,
        provider: "local",
        status: "ok",
        durationMs,
        quantumProfile: "hybrid-pq",
      });

      return res.json({
        url: `${config.publicBaseUrl}/gracias-donativo?source=local&rid=${requestId}`,
      });
    }

    // Rama Stripe (pre‑cuántico en la API, mitigado por TLS híbrido en el edge)
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      submit_type: "donate", // copy más adecuado para donativos [web:429]
      success_url: `${config.publicBaseUrl}/gracias-donativo?session_id={CHECKOUT_SESSION_ID}&rid=${requestId}`,
      cancel_url: `${config.publicBaseUrl}/donar?rid=${requestId}`,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "mxn",
            unit_amount: cents,
            product_data: {
              name: "Donativo RDM Digital",
              description: "Aporte voluntario para infraestructura y archivo digital de Real del Monte",
            },
          },
        },
      ],
      metadata: {
        purpose: "rdm_donation",
        requestId,
        // Campos que podrían enlazarse con un futuro ledger post‑cuántico
        quantum_profile: "hybrid-pq",
        // Ej: ID de usuario, origen, etc. si ya manejas auth
      },
    });

    const durationMs = Date.now() - startedAt;
    emit("info", "Stripe donation session created", {
      requestId,
      ip,
      userAgent,
      amount,
      cents,
      provider: "stripe",
      status: "ok",
      stripeSessionId: session.id,
      durationMs,
      quantumProfile: "hybrid-pq",
    });

    return res.json({ url: session.url, requestId });
  } catch (error) {
    const durationMs = Date.now() - startedAt;
    const err = error as Error;
    emit("error", "Donation checkout error", {
      requestId,
      ip,
      userAgent,
      status: "error",
      errorName: err.name,
      errorMessage: err.message,
      durationMs,
      quantumProfile: "hybrid-pq",
    });

    // No exponemos detalles internos al cliente
    return res.status(502).json({ error: "Donation checkout unavailable" });
  }
});

export default donationsRouter;
