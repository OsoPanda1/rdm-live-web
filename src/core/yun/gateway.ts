/**
 * YUN Gateway — Request Protection Layer
 * Per YUN Constitution Principle #5 (Edge-First with Cloud Fallback)
 * and Principle #6 (Observable by Default)
 *
 * Provides: rate limiting, circuit breaker, request validation, auth middleware.
 */

import type { YunGatewayConfig } from './types';

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

const DEFAULT_CONFIG: YunGatewayConfig = {
  rateLimit: {
    windowMs: 60_000, // 1 minute
    maxPerWindow: 100,
    maxPerUser: 30,
  },
  circuitBreaker: {
    failureThreshold: 5,
    resetTimeoutMs: 30_000,
    halfOpenMax: 3,
  },
  tls: {
    minVersion: 'TLSv1.2',
    ciphers: [
      'TLS_AES_256_GCM_SHA384',
      'TLS_CHACHA20_POLY1305_SHA256',
      'TLS_AES_128_GCM_SHA256',
    ],
  },
};

// ============================================================================
// RATE LIMITER
// ============================================================================

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface UserRateLimitEntry {
  count: number;
  resetAt: number;
}

const globalRateLimits: Map<string, RateLimitEntry> = new Map();
const userRateLimits: Map<string, UserRateLimitEntry> = new Map();

/**
 * Checks if a request is allowed under rate limits.
 * Returns { allowed, remaining, resetAt }.
 */
export function checkRateLimit(
  endpoint: string,
  userId: string,
  config: YunGatewayConfig['rateLimit'] = DEFAULT_CONFIG.rateLimit,
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const windowStart = now - config.windowMs;

  // Clean up old entries periodically
  cleanupExpiredEntries(windowStart);

  // Global endpoint rate limit
  const globalKey = `global:${endpoint}`;
  const globalEntry = globalRateLimits.get(globalKey);

  if (globalEntry && globalEntry.resetAt > now) {
    if (globalEntry.count >= config.maxPerWindow) {
      return { allowed: false, remaining: 0, resetAt: globalEntry.resetAt };
    }
    globalEntry.count++;
  } else {
    globalRateLimits.set(globalKey, { count: 1, resetAt: now + config.windowMs });
  }

  // Per-user rate limit
  const userKey = `user:${userId}:${endpoint}`;
  const userEntry = userRateLimits.get(userKey);

  if (userEntry && userEntry.resetAt > now) {
    if (userEntry.count >= config.maxPerUser) {
      return { allowed: false, remaining: 0, resetAt: userEntry.resetAt };
    }
    userEntry.count++;
  } else {
    userRateLimits.set(userKey, { count: 1, resetAt: now + config.windowMs });
  }

  const globalRemaining = (globalRateLimits.get(globalKey)?.count ?? 1);
  const userRemaining = (userRateLimits.get(userKey)?.count ?? 1);

  return {
    allowed: true,
    remaining: Math.min(config.maxPerWindow - globalRemaining, config.maxPerUser - userRemaining),
    resetAt: Math.min(
      globalRateLimits.get(globalKey)?.resetAt ?? now + config.windowMs,
      userRateLimits.get(userKey)?.resetAt ?? now + config.windowMs,
    ),
  };
}

function cleanupExpiredEntries(windowStart: number): void {
  for (const [key, entry] of globalRateLimits) {
    if (entry.resetAt < windowStart) globalRateLimits.delete(key);
  }
  for (const [key, entry] of userRateLimits) {
    if (entry.resetAt < windowStart) userRateLimits.delete(key);
  }
}

/**
 * Returns rate limit headers for HTTP responses.
 */
export function getRateLimitHeaders(
  result: ReturnType<typeof checkRateLimit>,
): Record<string, string> {
  return {
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
    ...(result.allowed ? {} : { 'Retry-After': String(Math.ceil((result.resetAt - Date.now()) / 1000)) }),
  };
}

// ============================================================================
// CIRCUIT BREAKER
// ============================================================================

type CircuitState = 'closed' | 'open' | 'half-open';

interface CircuitBreakerEntry {
  state: CircuitState;
  failureCount: number;
  successCount: number;
  lastFailureTime: number;
  lastStateChange: number;
}

const circuits: Map<string, CircuitBreakerEntry> = new Map();

/**
 * Records a failure for a circuit.
 */
export function recordFailure(
  circuitId: string,
  config: YunGatewayConfig['circuitBreaker'] = DEFAULT_CONFIG.circuitBreaker,
): void {
  const entry = circuits.get(circuitId) ?? {
    state: 'closed' as CircuitState,
    failureCount: 0,
    successCount: 0,
    lastFailureTime: 0,
    lastStateChange: Date.now(),
  };

  entry.failureCount++;
  entry.lastFailureTime = Date.now();

  if (entry.failureCount >= config.failureThreshold && entry.state === 'closed') {
    entry.state = 'open';
    entry.lastStateChange = Date.now();
  }

  circuits.set(circuitId, entry);
}

/**
 * Records a success for a circuit.
 */
export function recordSuccess(circuitId: string): void {
  const entry = circuits.get(circuitId);
  if (!entry) return;

  if (entry.state === 'half-open') {
    entry.successCount++;
    if (entry.successCount >= DEFAULT_CONFIG.circuitBreaker.halfOpenMax) {
      entry.state = 'closed';
      entry.failureCount = 0;
      entry.successCount = 0;
      entry.lastStateChange = Date.now();
    }
  } else if (entry.state === 'closed') {
    entry.failureCount = Math.max(0, entry.failureCount - 1);
  }

  circuits.set(circuitId, entry);
}

/**
 * Checks if a circuit allows requests.
 */
export function checkCircuit(
  circuitId: string,
  config: YunGatewayConfig['circuitBreaker'] = DEFAULT_CONFIG.circuitBreaker,
): { allowed: boolean; state: CircuitState; retryAfterMs?: number } {
  const entry = circuits.get(circuitId);

  if (!entry) {
    return { allowed: true, state: 'closed' };
  }

  switch (entry.state) {
    case 'closed':
      return { allowed: true, state: 'closed' };

    case 'open': {
      const elapsed = Date.now() - entry.lastStateChange;
      if (elapsed >= config.resetTimeoutMs) {
        entry.state = 'half-open';
        entry.lastStateChange = Date.now();
        entry.successCount = 0;
        circuits.set(circuitId, entry);
        return { allowed: true, state: 'half-open' };
      }
      return {
        allowed: false,
        state: 'open',
        retryAfterMs: config.resetTimeoutMs - elapsed,
      };
    }

    case 'half-open':
      return { allowed: true, state: 'half-open' };
  }
}

/**
 * Returns the current state of all circuits (for observability).
 */
export function getCircuitStates(): Map<string, CircuitState> {
  const states = new Map<string, CircuitState>();
  for (const [id, entry] of circuits) {
    states.set(id, entry.state);
  }
  return states;
}

/**
 * Manually resets a circuit to closed state.
 */
export function resetCircuit(circuitId: string): void {
  const entry = circuits.get(circuitId);
  if (entry) {
    entry.state = 'closed';
    entry.failureCount = 0;
    entry.successCount = 0;
    entry.lastStateChange = Date.now();
    circuits.set(circuitId, entry);
  }
}

// ============================================================================
// REQUEST VALIDATION
// ============================================================================

export interface ValidationRule {
  field: string;
  type: 'string' | 'number' | 'boolean' | 'email' | 'uuid' | 'json';
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

/**
 * Validates a request payload against a set of rules.
 */
export function validateRequest(
  data: Record<string, unknown>,
  rules: ValidationRule[],
): ValidationResult {
  const errors: string[] = [];

  for (const rule of rules) {
    const value = data[rule.field];

    // Required check
    if (rule.required && (value === undefined || value === null)) {
      errors.push(`${rule.field} is required`);
      continue;
    }

    // Skip further checks if value is undefined and not required
    if (value === undefined || value === null) continue;

    // Type checks
    switch (rule.type) {
      case 'string':
        if (typeof value !== 'string') {
          errors.push(`${rule.field} must be a string`);
        } else {
          if (rule.minLength !== undefined && value.length < rule.minLength) {
            errors.push(`${rule.field} must be at least ${rule.minLength} characters`);
          }
          if (rule.maxLength !== undefined && value.length > rule.maxLength) {
            errors.push(`${rule.field} must be at most ${rule.maxLength} characters`);
          }
          if (rule.pattern && !rule.pattern.test(value)) {
            errors.push(`${rule.field} does not match required pattern`);
          }
        }
        break;

      case 'number':
        if (typeof value !== 'number' || !Number.isFinite(value)) {
          errors.push(`${rule.field} must be a finite number`);
        } else {
          if (rule.min !== undefined && value < rule.min) {
            errors.push(`${rule.field} must be at least ${rule.min}`);
          }
          if (rule.max !== undefined && value > rule.max) {
            errors.push(`${rule.field} must be at most ${rule.max}`);
          }
        }
        break;

      case 'boolean':
        if (typeof value !== 'boolean') {
          errors.push(`${rule.field} must be a boolean`);
        }
        break;

      case 'email':
        if (typeof value !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.push(`${rule.field} must be a valid email`);
        }
        break;

      case 'uuid':
        if (
          typeof value !== 'string' ||
          !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
        ) {
          errors.push(`${rule.field} must be a valid UUID`);
        }
        break;

      case 'json':
        if (typeof value === 'string') {
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

// ============================================================================
// GATEWAY REQUEST HANDLER
// ============================================================================

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

/**
 * Processes a request through the full gateway pipeline:
 * 1. Rate limiting
 * 2. Circuit breaker check
 * 3. Request validation
 * 4. Auth validation
 *
 * Returns the response or an error.
 */
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

  // 1. Rate limiting
  const userId = request.userId ?? 'anonymous';
  const rateResult = checkRateLimit(request.path, userId, config.rateLimit);
  Object.assign(headers, getRateLimitHeaders(rateResult));

  if (!rateResult.allowed) {
    return {
      status: 429,
      body: { error: 'Rate limit exceeded', retryAfterMs: rateResult.resetAt - Date.now() },
      headers,
    };
  }

  // 2. Circuit breaker
  if (options.circuitId) {
    const circuitResult = checkCircuit(options.circuitId, config.circuitBreaker);
    if (!circuitResult.allowed) {
      return {
        status: 503,
        body: {
          error: 'Service temporarily unavailable',
          state: circuitResult.state,
          retryAfterMs: circuitResult.retryAfterMs,
        },
        headers: { ...headers, 'Retry-After': String(Math.ceil((circuitResult.retryAfterMs ?? 0) / 1000)) },
      };
    }
  }

  // 3. Request validation
  if (options.validationRules && request.body) {
    const validationResult = validateRequest(
      request.body as Record<string, unknown>,
      options.validationRules,
    );
    if (!validationResult.valid) {
      return {
        status: 400,
        body: { error: 'Validation failed', details: validationResult.errors },
        headers,
      };
    }
  }

  // 4. Auth check (simplified — real auth uses JWT validation)
  if (!request.userId) {
    return {
      status: 401,
      body: { error: 'Authentication required' },
      headers,
    };
  }

  // If all checks pass, return success
  return {
    status: 200,
    body: { success: true },
    headers,
  };
}
