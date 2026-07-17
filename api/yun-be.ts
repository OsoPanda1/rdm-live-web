import { yunBeAgent } from "../src/core/yun/be";
import { handleCors, getCorsHeaders } from "./_shared/cors";
import { checkRateLimit } from "./_shared/rate-limit";

function json(req: Request, body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "no-store",
      ...getCorsHeaders(req.headers.get("origin")),
    },
  });
}

function authorized(req: Request): boolean {
  const expected = process.env.YUNBE_INTERNAL_TOKEN;
  if (!expected) return req.method === "GET";
  return req.headers.get("authorization") === `Bearer ${expected}`;
}

export default async function handler(req: Request): Promise<Response> {
  const cors = handleCors(req);
  if (cors) return cors;

  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const rate = checkRateLimit(`yunbe:${ip}`, 60, 60_000);
  if (!rate.allowed) return json(req, { error: "rate_limited" }, 429);
  if (!authorized(req)) return json(req, { error: "unauthorized" }, 401);

  if (req.method === "GET") {
    return json(req, yunBeAgent.getStatus());
  }

  if (req.method !== "POST") {
    return json(req, { error: "method_not_allowed" }, 405);
  }

  const body = await req.json().catch(() => ({}));
  const action = typeof body.action === "string" ? body.action : "health";

  if (action === "journal") {
    const entry = await yunBeAgent.journal(
      body.operationType ?? "kernel_signal",
      {
        userId: body.userId,
        sourceSystem: body.sourceSystem ?? "api/yun-be",
        payload: body.payload ?? {},
        riskClass: body.riskClass ?? "medium",
        federation: body.federation,
        idempotencyKey: body.idempotencyKey,
      },
      body.metadata ?? {},
    );
    return json(req, { ok: true, entry }, 201);
  }

  if (action === "complete") {
    if (!body.journalId) return json(req, { error: "journalId_required" }, 400);
    await yunBeAgent.complete(body.journalId, body.metadata ?? {});
    return json(req, { ok: true });
  }

  if (action === "recover") {
    const report = await yunBeAgent.runRecoveryCycle(Number(body.limit ?? 25));
    return json(req, { ok: true, report });
  }

  const nextState = await yunBeAgent.ingestHealthSignals(body.signals ?? []);
  return json(req, { ok: true, state: nextState, status: yunBeAgent.getStatus() });
}
