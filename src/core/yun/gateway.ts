import type { YunGatewayConfig } from "./types";

const DEFAULT_CONFIG: YunGatewayConfig = {
  rateLimit: { windowMs: 60_000, maxPerWindow: 100, maxPerUser: 30 },
  circuitBreaker: { failureThreshold: 5, resetTimeoutMs: 30_000, halfOpenMax: 3 },
  tls: {
    minVersion: "TLSv1.2",
    ciphers: ["TLS_AES_256_GCM_SHA384", "TLS_CHACHA20_POLY1305_SHA256", "TLS_AES_128_GCM_SHA256"],
  },
};

interface RateLimitEntry {
  count: number;
  resetAt: number;
}
interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  scope?: "global" | "user";
}
const globalRateLimits: Map<string, RateLimitEntry> = new Map();
const userRateLimits: Map<string, RateLimitEntry> = new Map();

export function checkRateLimit(
  endpoint: string,
  userId: string,
  config = DEFAULT_CONFIG.rateLimit,
): RateLimitResult {
  const now = Date.now();
  cleanupExpiredEntries(now);
  const globalKey = `global:${endpoint}`;
  const userKey = `user:${userId || "anonymous"}:${endpoint}`;
  const globalEntry = getActiveRateLimitEntry(globalRateLimits, globalKey, now, config.windowMs);
  const userEntry = getActiveRateLimitEntry(userRateLimits, userKey, now, config.windowMs);
  const resetAt = Math.max(globalEntry.resetAt, userEntry.resetAt);

  if (globalEntry.count >= config.maxPerWindow) {
    return { allowed: false, remaining: 0, resetAt: globalEntry.resetAt, scope: "global" };
  }

  if (userEntry.count >= config.maxPerUser) {
    return { allowed: false, remaining: 0, resetAt: userEntry.resetAt, scope: "user" };
  }

  globalEntry.count++;
  userEntry.count++;

  return {
    allowed: true,
    remaining: Math.min(
      config.maxPerWindow - globalEntry.count,
      config.maxPerUser - userEntry.count,
    ),
    resetAt,
  };
}

function getActiveRateLimitEntry(
  store: Map<string, RateLimitEntry>,
  key: string,
  now: number,
  windowMs: number,
): RateLimitEntry {
  const existing = store.get(key);
  if (existing && existing.resetAt > now) return existing;
  const fresh = { count: 0, resetAt: now + windowMs };
  store.set(key, fresh);
  return fresh;
}

function cleanupExpiredEntries(now: number): void {
  for (const [key, entry] of globalRateLimits)
    if (entry.resetAt <= now) globalRateLimits.delete(key);
  for (const [key, entry] of userRateLimits) if (entry.resetAt <= now) userRateLimits.delete(key);
}

export function getRateLimitHeaders(result: ReturnType<typeof checkRateLimit>) {
  return {
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
  };
}

type CircuitState = "closed" | "open" | "half-open";
interface CircuitBreakerEntry {
  state: CircuitState;
  failureCount: number;
  successCount: number;
  lastFailureTime: number;
  lastStateChange: number;
}
const circuits: Map<string, CircuitBreakerEntry> = new Map();

export function recordFailure(circuitId: string, config = DEFAULT_CONFIG.circuitBreaker): void {
  const entry = circuits.get(circuitId) ?? {
    state: "closed" as CircuitState,
    failureCount: 0,
    successCount: 0,
    lastFailureTime: 0,
    lastStateChange: Date.now(),
  };
  entry.failureCount++;
  entry.lastFailureTime = Date.now();
  if (entry.failureCount >= config.failureThreshold && entry.state === "closed") {
    entry.state = "open";
    entry.lastStateChange = Date.now();
  }
  circuits.set(circuitId, entry);
}

export function recordSuccess(circuitId: string): void {
  const entry = circuits.get(circuitId);
  if (!entry) return;
  if (entry.state === "half-open") {
    entry.successCount++;
    if (entry.successCount >= DEFAULT_CONFIG.circuitBreaker.halfOpenMax) {
      entry.state = "closed";
      entry.failureCount = 0;
      entry.successCount = 0;
      entry.lastStateChange = Date.now();
    }
  } else if (entry.state === "closed") entry.failureCount = Math.max(0, entry.failureCount - 1);
  circuits.set(circuitId, entry);
}

export function checkCircuit(circuitId: string, config = DEFAULT_CONFIG.circuitBreaker) {
  const entry = circuits.get(circuitId);
  if (!entry) return { allowed: true, state: "closed" as CircuitState };
  if (entry.state === "closed") return { allowed: true, state: "closed" as CircuitState };
  if (entry.state === "open") {
    const elapsed = Date.now() - entry.lastStateChange;
    if (elapsed >= config.resetTimeoutMs) {
      entry.state = "half-open";
      entry.lastStateChange = Date.now();
      entry.successCount = 0;
      circuits.set(circuitId, entry);
      return { allowed: true, state: "half-open" as CircuitState };
    }
    return {
      allowed: false,
      state: "open" as CircuitState,
      retryAfterMs: config.resetTimeoutMs - elapsed,
    };
  }
  return { allowed: true, state: "half-open" as CircuitState };
}

export function getCircuitStates(): Map<string, CircuitState> {
  const states = new Map<string, CircuitState>();
  for (const [id, entry] of circuits) states.set(id, entry.state);
  return states;
}

export function resetCircuit(circuitId: string): void {
  const entry = circuits.get(circuitId);
  if (entry) {
    entry.state = "closed";
    entry.failureCount = 0;
    entry.successCount = 0;
    entry.lastStateChange = Date.now();
    circuits.set(circuitId, entry);
  }
}

export interface ValidationRule {
  field: string;
  type: "string" | "number" | "boolean" | "email" | "uuid" | "json";
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
}
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateRequest(
  data: Record<string, unknown>,
  rules: ValidationRule[],
): ValidationResult {
  const errors: string[] = [];
  for (const rule of rules) {
    const value = data[rule.field];
    if (rule.required && (value === undefined || value === null)) {
      errors.push(`${rule.field} is required`);
      continue;
    }
    if (value === undefined || value === null) continue;
    switch (rule.type) {
      case "string":
        if (typeof value !== "string") errors.push(`${rule.field} must be a string`);
        else {
          if (rule.minLength !== undefined && value.length < rule.minLength)
            errors.push(`${rule.field} must be at least ${rule.minLength} characters`);
          if (rule.maxLength !== undefined && value.length > rule.maxLength)
            errors.push(`${rule.field} must be at most ${rule.maxLength} characters`);
          if (rule.pattern && !rule.pattern.test(value))
            errors.push(`${rule.field} does not match required pattern`);
        }
        break;
      case "number":
        if (typeof value !== "number" || !Number.isFinite(value))
          errors.push(`${rule.field} must be a finite number`);
        else {
          if (rule.min !== undefined && value < rule.min)
            errors.push(`${rule.field} must be at least ${rule.min}`);
          if (rule.max !== undefined && value > rule.max)
            errors.push(`${rule.field} must be at most ${rule.max}`);
        }
        break;
      case "boolean":
        if (typeof value !== "boolean") errors.push(`${rule.field} must be a boolean`);
        break;
      case "email":
        if (typeof value !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
          errors.push(`${rule.field} must be a valid email`);
        break;
      case "uuid":
        if (
          typeof value !== "string" ||
          !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
        )
          errors.push(`${rule.field} must be a valid UUID`);
        break;
      case "json":
        if (typeof value === "string") {
          try {
            JSON.parse(value);
          } catch {
            errors.push(`${rule.field} must be valid JSON`);
          }
        }
        break;
    }
  }
  return { valid: errors.length === 0, errors };
}

export interface GatewayRequest {
  method: string;
  path: string;
  userId?: string;
  body?: unknown;
  headers: Record<string, string>;
}
export interface GatewayResponse {
  status: number;
  body: unknown;
  headers: Record<string, string>;
}

export async function processRequest(
  request: GatewayRequest,
  options: {
    validationRules?: ValidationRule[];
    circuitId?: string;
    config?: Partial<YunGatewayConfig>;
  } = {},
): Promise<GatewayResponse> {
  const config = { ...DEFAULT_CONFIG, ...options.config };
  const headers: Record<string, string> = {};
  const userId = request.userId ?? "anonymous";
  const rateResult = checkRateLimit(request.path, userId, config.rateLimit);
  Object.assign(headers, getRateLimitHeaders(rateResult));
  if (!rateResult.allowed) return { status: 429, body: { error: "Rate limit exceeded" }, headers };
  if (options.circuitId) {
    const circuitResult = checkCircuit(options.circuitId, config.circuitBreaker);
    if (!circuitResult.allowed)
      return {
        status: 503,
        body: { error: "Service unavailable", state: circuitResult.state },
        headers: {
          ...headers,
          "Retry-After": String(Math.ceil((circuitResult.retryAfterMs ?? 0) / 1000)),
        },
      };
  }
  if (options.validationRules && request.body) {
    const validationResult = validateRequest(
      request.body as Record<string, unknown>,
      options.validationRules,
    );
    if (!validationResult.valid)
      return {
        status: 400,
        body: { error: "Validation failed", details: validationResult.errors },
        headers,
      };
  }
  if (!request.userId) return { status: 401, body: { error: "Authentication required" }, headers };
  return { status: 200, body: { success: true }, headers };
}
