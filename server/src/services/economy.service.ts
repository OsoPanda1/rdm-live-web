// ============================================================================
// RDM Digital OS — Economy Kernel v3 (refined)
// Membership tiers, dynamic quotas, token ledger, audit & HTTP API
// ============================================================================

import { randomUUID } from "node:crypto";
import { db } from "../lib/store.js";
import { emitMsrEvent } from "./audit.service.js";

// ---------------------------------------------------------------------------
// 1. Types & tier config
// ---------------------------------------------------------------------------

export type MembershipTier = "free" | "creator" | "guardian" | "institutional";

export interface MembershipRecord {
  userId: string;
  tier: MembershipTier;
  active: boolean;
  quota: number;
  updatedAt: string;
}

export interface TokenBalanceRecord {
  userId: string;
  balance: number;
  updatedAt: string;
}

export type LedgerEntryKind = "credit" | "debit";

export interface LedgerEntry {
  id: string;
  userId: string;
  kind: LedgerEntryKind;
  amount: number;
  reason: string;
  createdAt: string;
  sessionId?: string;
  requestId?: string;
}

export interface QuotaSnapshot {
  userId: string;
  tier: MembershipTier;
  baseQuota: number;
  effectiveQuota: number;
  consumedInWindow: number;
  windowStartedAt: string;
  refreshedAt: string;
}

// Config base de cuotas por tier (tokens por ventana)
const baseTierQuota: Record<MembershipTier, number> = {
  free: 100,
  creator: 500,
  guardian: 1500,
  institutional: 10_000,
};

// Ventana de refresco de cuotas (ej. 24h)
const QUOTA_WINDOW_MS = 24 * 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// 2. Utils: UUID + time
// ---------------------------------------------------------------------------

function generateId(): string {
  return randomUUID();
}

function isoNow(): string {
  return new Date().toISOString();
}

function nowMs(): number {
  return Date.now();
}

// ---------------------------------------------------------------------------
// 3. Membership lifecycle
// ---------------------------------------------------------------------------

export function ensureMembership(userId: string): MembershipRecord {
  const existing = db.memberships.get(userId) as MembershipRecord | undefined;
  if (existing) return existing;

  const record: MembershipRecord = {
    userId,
    tier: "free",
    active: true,
    quota: baseTierQuota.free,
    updatedAt: isoNow(),
  };

  db.memberships.set(userId, record);
  return record;
}

export function setMembership(input: {
  userId: string;
  tier: MembershipTier;
}): MembershipRecord {
  const tier = input.tier;
  const quota = baseTierQuota[tier];

  const membership: MembershipRecord = {
    userId: input.userId,
    tier,
    active: true,
    quota,
    updatedAt: isoNow(),
  };

  db.memberships.set(input.userId, membership);

  emitMsrEvent({
    layer: "L5",
    category: "economy.membership.updated",
    summary: `Membresía ${tier}`,
    payload: {
      userId: input.userId,
      tier,
      quota,
    },
  });

  return membership;
}

// ---------------------------------------------------------------------------
// 4. Dynamic quota resolver with temporal refresh
// ---------------------------------------------------------------------------

/**
 * En memoria, pero podrías persistir esto en un store aparte.
 * Clave: userId
 */
const quotaSnapshots = new Map<string, QuotaSnapshot>();

/**
 * Resuelve la cuota efectiva y la ventana actual para un usuario.
 * Aplica lógica de refresco temporal: si la ventana expiró, reinicia consumo.
 */
export function resolveDynamicQuota(userId: string): QuotaSnapshot {
  const membership = ensureMembership(userId);
  const baseQuota = baseTierQuota[membership.tier];
  const now = nowMs();

  const existing = quotaSnapshots.get(userId);
  if (!existing) {
    const snapshot: QuotaSnapshot = {
      userId,
      tier: membership.tier,
      baseQuota,
      effectiveQuota: baseQuota,
      consumedInWindow: 0,
      windowStartedAt: isoNow(),
      refreshedAt: isoNow(),
    };
    quotaSnapshots.set(userId, snapshot);
    return snapshot;
  }

  const windowStartMs = Date.parse(existing.windowStartedAt);
  const windowExpired =
    Number.isFinite(windowStartMs) && now - windowStartMs > QUOTA_WINDOW_MS;

  if (windowExpired || existing.tier !== membership.tier) {
    const snapshot: QuotaSnapshot = {
      userId,
      tier: membership.tier,
      baseQuota,
      effectiveQuota: baseQuota,
      consumedInWindow: 0,
      windowStartedAt: isoNow(),
      refreshedAt: isoNow(),
    };
    quotaSnapshots.set(userId, snapshot);
    return snapshot;
  }

  const snapshot: QuotaSnapshot = {
    ...existing,
    tier: membership.tier,
    baseQuota,
    effectiveQuota: baseQuota,
    refreshedAt: isoNow(),
  };
  quotaSnapshots.set(userId, snapshot);
  return snapshot;
}

/**
 * Intenta consumir tokens de la cuota dinámica.
 * Devuelve ok=false si se excede la cuota.
 */
export function tryConsumeQuota(
  userId: string,
  amount: number,
): { ok: boolean; snapshot: QuotaSnapshot } {
  const safeAmount = Number.isFinite(amount) ? Math.max(0, amount) : 0;
  const snapshot = resolveDynamicQuota(userId);

  const nextConsumed = snapshot.consumedInWindow + safeAmount;
  if (nextConsumed > snapshot.effectiveQuota) {
    return { ok: false, snapshot };
  }

  const updated: QuotaSnapshot = {
    ...snapshot,
    consumedInWindow: nextConsumed,
    refreshedAt: isoNow(),
  };
  quotaSnapshots.set(userId, updated);

  return { ok: true, snapshot: updated };
}

// ---------------------------------------------------------------------------
// 5. Token balances & ACID-like ledger operations
// ---------------------------------------------------------------------------

export function ensureTokenBalance(userId: string): TokenBalanceRecord {
  const existing = db.tokenBalances.get(userId) as TokenBalanceRecord | undefined;
  if (existing) return existing;

  const balance: TokenBalanceRecord = {
    userId,
    balance: 0,
    updatedAt: isoNow(),
  };

  db.tokenBalances.set(userId, balance);
  return balance;
}

export interface CreateLedgerEntryInput {
  userId: string;
  kind: LedgerEntryKind;
  amount: number;
  reason: string;
  sessionId?: string;
  requestId?: string;
}

/**
 * Transacción lógica ACID en memoria:
 * - Atomicidad: o se aplican ledger + balance + cuota o no se aplica nada.
 * - Consistencia: no se permite gasto que deje saldo negativo.
 * - Aislamiento: asume single-threaded event loop (Node/browser).
 * - Durabilidad: limitada al proceso; para real se persiste en DB/ledger externo.
 */
export function createLedgerEntryTransaction(
  input: CreateLedgerEntryInput,
): { entry: LedgerEntry; balance: TokenBalanceRecord } {
  const amount = Number.isFinite(input.amount) ? Math.max(0, input.amount) : 0;
  const membership = ensureMembership(input.userId);

  // 1) Validar cuota dinámica para débitos (gasto)
  if (input.kind === "debit") {
    const { ok } = tryConsumeQuota(input.userId, amount);
    if (!ok) {
      throw new Error(
        `QuotaExceeded: usuario ${input.userId} excede cuota de tier ${membership.tier}`,
      );
    }
  }

  // 2) Cargar balance actual
  const balance = ensureTokenBalance(input.userId);
  const delta = input.kind === "credit" ? amount : -amount;
  const nextBalance = balance.balance + delta;

  if (nextBalance < 0) {
    throw new Error(
      `InsufficientFunds: saldo actual ${balance.balance}, intento de gasto ${amount}`,
    );
  }

  // 3) Construir entrada de ledger
  const id = generateId();
  const entry: LedgerEntry = {
    id,
    userId: input.userId,
    kind: input.kind,
    amount,
    reason: input.reason,
    createdAt: isoNow(),
    sessionId: input.sessionId,
    requestId: input.requestId,
  };

  // 4) Aplicar cambios de forma atómica (en memoria)
  db.ledger.set(id, entry);
  balance.balance = nextBalance;
  balance.updatedAt = isoNow();

  emitMsrEvent({
    layer: "L5",
    category: "economy.token.ledger",
    summary: `Ledger ${input.kind} ${amount}`,
    payload: {
      userId: input.userId,
      entryId: id,
      kind: input.kind,
      amount,
      balance: balance.balance,
      reason: input.reason,
      tier: membership.tier,
    },
  });

  return { entry, balance };
}

export function createLedgerEntry(input: CreateLedgerEntryInput) {
  return createLedgerEntryTransaction(input);
}

// ---------------------------------------------------------------------------
// 6. Session spending validation service
// ---------------------------------------------------------------------------

export interface SessionSpendingContext {
  userId: string;
  sessionId: string;
}

export interface SessionSpendingRecord {
  sessionId: string;
  userId: string;
  spent: number;
  updatedAt: string;
}

const sessionSpend = new Map<string, SessionSpendingRecord>();

export interface SessionSpendingPolicy {
  maxSessionSpendByTier: Record<MembershipTier, number>;
}

const defaultSessionPolicy: SessionSpendingPolicy = {
  maxSessionSpendByTier: {
    free: 50,
    creator: 300,
    guardian: 900,
    institutional: 5_000,
  },
};

export interface SessionSpendingValidationResult {
  allowed: boolean;
  remaining: number;
  reason?: string;
}

export class SessionSpendingValidator {
  private readonly policy: SessionSpendingPolicy;

  constructor(policy: SessionSpendingPolicy = defaultSessionPolicy) {
    this.policy = policy;
  }

  private getKey(ctx: SessionSpendingContext): string {
    return `${ctx.userId}:${ctx.sessionId}`;
  }

  validate(
    ctx: SessionSpendingContext,
    amount: number,
  ): SessionSpendingValidationResult {
    const safeAmount = Number.isFinite(amount) ? Math.max(0, amount) : 0;
    const membership = ensureMembership(ctx.userId);
    const maxPerSession =
      this.policy.maxSessionSpendByTier[membership.tier] ?? 0;

    const key = this.getKey(ctx);
    const existing = sessionSpend.get(key);

    const spent = existing?.spent ?? 0;
    const nextSpent = spent + safeAmount;

    if (nextSpent > maxPerSession) {
      return {
        allowed: false,
        remaining: Math.max(0, maxPerSession - spent),
        reason: "SessionLimitExceeded",
      };
    }

    const record: SessionSpendingRecord = {
      sessionId: ctx.sessionId,
      userId: ctx.userId,
      spent: nextSpent,
      updatedAt: isoNow(),
    };
    sessionSpend.set(key, record);

    return {
      allowed: true,
      remaining: maxPerSession - nextSpent,
    };
  }
}

export const sessionSpendingValidator = new SessionSpendingValidator();

// ---------------------------------------------------------------------------
// 7. Audit middleware for tier usage (framework-agnostic)
// ---------------------------------------------------------------------------

export interface EconomyAuditContext {
  userId: string;
  tier: MembershipTier;
  path: string;
  method: string;
  sessionId?: string;
  requestId?: string;
}

export function auditTierUsage(ctx: EconomyAuditContext): void {
  emitMsrEvent({
    layer: "L5",
    category: "economy.tier.usage",
    summary: `Uso de tier ${ctx.tier} en ${ctx.path}`,
    payload: {
      userId: ctx.userId,
      tier: ctx.tier,
      path: ctx.path,
      method: ctx.method,
      sessionId: ctx.sessionId ?? "",
      requestId: ctx.requestId ?? "",
    },
  });
}

// ---------------------------------------------------------------------------
// 8. Read model: per-user economy snapshot
// ---------------------------------------------------------------------------

export function getEconomySummary(userId: string) {
  const membership = ensureMembership(userId);
  const balance = ensureTokenBalance(userId);
  const ledger = [...db.ledger.values()]
    .filter((item) => (item as LedgerEntry).userId === userId)
    .slice(-30) as LedgerEntry[];

  const quota = resolveDynamicQuota(userId);

  return { membership, balance, ledger, quota };
}

// ---------------------------------------------------------------------------
// 9. HTTP API endpoints (framework-agnostic contracts)
// ---------------------------------------------------------------------------

export interface RequestLike {
  method: string;
  path: string;
  params: Record<string, string>;
  query: Record<string, string | string[] | undefined>;
  body?: any;
  headers: Record<string, string | string[] | undefined>;
  userId?: string;
  sessionId?: string;
  requestId?: string;
}

export interface ResponseLike {
  status(code: number): this;
  json(payload: unknown): void;
}

function getUserIdOrThrow(req: RequestLike): string {
  const userId = req.userId;
  if (!userId) {
    throw new Error("Unauthorized: userId missing in request context");
  }
  return userId;
}

/**
 * GET /api/economy/summary
 */
export function handleGetEconomySummary(req: RequestLike, res: ResponseLike) {
  try {
    const userId = getUserIdOrThrow(req);
    const membership = ensureMembership(userId);

    auditTierUsage({
      userId,
      tier: membership.tier,
      path: req.path,
      method: req.method,
      sessionId: req.sessionId,
      requestId: req.requestId,
    });

    const summary = getEconomySummary(userId);
    res.status(200).json(summary);
  } catch (err: any) {
    res.status(401).json({ error: err?.message ?? "Unauthorized" });
  }
}

/**
 * POST /api/tokens/credit
 * body: { amount: number, reason: string }
 */
export function handleCreditTokens(req: RequestLike, res: ResponseLike) {
  try {
    const userId = getUserIdOrThrow(req);
    const membership = ensureMembership(userId);

    auditTierUsage({
      userId,
      tier: membership.tier,
      path: req.path,
      method: req.method,
      sessionId: req.sessionId,
      requestId: req.requestId,
    });

    const amount = Number(req.body?.amount ?? 0);
    const reason = String(req.body?.reason ?? "credit");

    const { entry, balance } = createLedgerEntryTransaction({
      userId,
      kind: "credit",
      amount,
      reason,
      sessionId: req.sessionId,
      requestId: req.requestId,
    });

    res.status(200).json({ entry, balance });
  } catch (err: any) {
    res.status(400).json({ error: err?.message ?? "Bad Request" });
  }
}

/**
 * POST /api/tokens/debit
 * body: { amount: number, reason: string }
 */
export function handleDebitTokens(req: RequestLike, res: ResponseLike) {
  try {
    const userId = getUserIdOrThrow(req);
    const membership = ensureMembership(userId);

    auditTierUsage({
      userId,
      tier: membership.tier,
      path: req.path,
      method: req.method,
      sessionId: req.sessionId,
      requestId: req.requestId,
    });

    const amount = Number(req.body?.amount ?? 0);
    const reason = String(req.body?.reason ?? "debit");

    const sessionId = req.sessionId ?? "anonymous-session";
    const validation = sessionSpendingValidator.validate(
      { userId, sessionId },
      amount,
    );

    if (!validation.allowed) {
      res.status(429).json({
        error: validation.reason ?? "SessionLimitExceeded",
        remaining: validation.remaining,
      });
      return;
    }

    const { entry, balance } = createLedgerEntryTransaction({
      userId,
      kind: "debit",
      amount,
      reason,
      sessionId,
      requestId: req.requestId,
    });

    res
      .status(200)
      .json({ entry, balance, remainingSession: validation.remaining });
  } catch (err: any) {
    res.status(400).json({ error: err?.message ?? "Bad Request" });
  }
}

/**
 * POST /api/membership/tier
 * body: { tier: MembershipTier }
 */
export function handleSetMembershipTier(req: RequestLike, res: ResponseLike) {
  try {
    const userId = getUserIdOrThrow(req);
    const tier = String(req.body?.tier) as MembershipTier;

    if (!["free", "creator", "guardian", "institutional"].includes(tier)) {
      res.status(400).json({ error: "Invalid tier" });
      return;
    }

    const membership = setMembership({ userId, tier });

    auditTierUsage({
      userId,
      tier: membership.tier,
      path: req.path,
      method: req.method,
      sessionId: req.sessionId,
      requestId: req.requestId,
    });

    res.status(200).json({ membership });
  } catch (err: any) {
    res.status(400).json({ error: err?.message ?? "Bad Request" });
  }
}
