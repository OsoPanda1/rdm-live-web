import { handleCors, getCorsHeaders } from "./_shared/cors.js";
import { checkRateLimit } from "./_shared/rate-limit.js";

interface YunBeEntry {
  id: string;
  operationType: string;
  userId?: string;
  sourceSystem: string;
  payload: Record<string, unknown>;
  riskClass: string;
  federation: number;
  status: string;
  createdAt: string;
  completedAt: string | null;
  metadata: Record<string, unknown>;
}

const store: YunBeEntry[] = [];

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

export default async function handler(req: Request): Promise<Response> {
  const cors = handleCors(req);
  if (cors) return cors;

  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const rate = checkRateLimit(`yunbe:${ip}`, 60, 60_000);
  if (!rate.allowed) return json(req, { error: "rate_limited" }, 429);

  if (req.method === "GET") {
    return json(req, {
      status: "operational",
      totalEntries: store.length,
      pendingRecoveries: store.filter(e => e.status === "pending").length,
      lastEntry: store[store.length - 1] ?? null,
    });
  }

  if (req.method !== "POST") {
    return json(req, { error: "method_not_allowed" }, 405);
  }

  const body = await req.json().catch(() => ({}));
  const action = typeof body.action === "string" ? body.action : "health";

  if (action === "journal") {
    const entry: YunBeEntry = {
      id: `yunbe-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      operationType: body.operationType ?? "kernel_signal",
      userId: body.userId,
      sourceSystem: body.sourceSystem ?? "api/yun-be",
      payload: body.payload ?? {},
      riskClass: body.riskClass ?? "medium",
      federation: body.federation ?? 1,
      status: "pending",
      createdAt: new Date().toISOString(),
      completedAt: null,
      metadata: body.metadata ?? {},
    };
    store.push(entry);
    return json(req, { ok: true, entry }, 201);
  }

  if (action === "complete") {
    if (!body.journalId) return json(req, { error: "journalId_required" }, 400);
    const entry = store.find(e => e.id === body.journalId);
    if (!entry) return json(req, { error: "not_found" }, 404);
    entry.status = "completed";
    entry.completedAt = new Date().toISOString();
    entry.metadata = { ...entry.metadata, ...(body.metadata ?? {}) };
    return json(req, { ok: true });
  }

  if (action === "recover") {
    const limit = Number(body.limit ?? 25);
    const pending = store.filter(e => e.status === "pending").slice(0, limit);
    const recovered = pending.map(e => {
      e.status = "completed";
      e.completedAt = new Date().toISOString();
      return e.id;
    });
    return json(req, { ok: true, recovered, count: recovered.length });
  }

  return json(req, { ok: true, status: "operational", totalEntries: store.length });
}
