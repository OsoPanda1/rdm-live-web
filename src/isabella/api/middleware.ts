// ISA-API v.1.0.0-evolved — Double Hexagon Security Middleware
// Validates API Key, JWT token, and double hexagon authorization

import type { ISAContext } from './types';

// ─── Configuration ──────────────────────────────────────────────────────────

const ISA_API_KEY = process.env.ISABELLA_API_KEY ?? '';
const ISA_JWT_SECRET = process.env.ISABELLA_JWT_SECRET ?? '';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface SecurityResult {
  valid: boolean;
  ctx?: ISAContext;
  error?: string;
  statusCode?: number;
}

export interface HexagonInput {
  innerHexagon: Record<string, unknown>;
  outerHexagon: Record<string, unknown>;
  actor: string;
  action: string;
  context?: Record<string, unknown>;
}

export interface HexagonResult {
  allowed: boolean;
  decision: string;
  rationale: string;
  auditId: string;
  traceId: string;
}

// ─── API Key Validation ─────────────────────────────────────────────────────

export function validateApiKey(key: string | null): boolean {
  if (!ISA_API_KEY) return true; // No key configured = open mode
  return key === ISA_API_KEY;
}

// ─── JWT Token Validation (simplified) ──────────────────────────────────────

export function validateTerritorialToken(token: string | null): { valid: boolean; payload?: Record<string, unknown>; error?: string } {
  if (!ISA_JWT_SECRET) return { valid: true }; // No secret configured = open mode
  if (!token) return { valid: false, error: 'Missing bearer token' };

  // Strip "Bearer " prefix
  const raw = token.startsWith('Bearer ') ? token.slice(7) : token;

  try {
    // Simplified JWT decode (in production use jsonwebtoken or jose)
    const parts = raw.split('.');
    if (parts.length !== 3) return { valid: false, error: 'Invalid JWT format' };

    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf-8'));

    // Check expiration
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return { valid: false, error: 'Token expired' };
    }

    // Check issuer
    if (payload.iss && payload.iss !== 'isabella-internal-api') {
      return { valid: false, error: 'Invalid issuer' };
    }

    return { valid: true, payload };
  } catch (err) {
    return { valid: false, error: `Token decode failed: ${(err as Error).message}` };
  }
}

// ─── Double Hexagon Validation ──────────────────────────────────────────────
// Inner hexagon: identity, kernel, memory, governance, audit
// Outer hexagon: interoperability, signal ingestion, result publication, territorial control

const INNER_HEXAGON_RULES: Record<string, (actor: string, action: string) => boolean> = {
  'identity:verify': (actor, action) => action.startsWith('identity:'),
  'kernel:execute': (actor, action) => action.startsWith('kernel:'),
  'memory:read': (actor, action) => action.startsWith('memory:') || action.startsWith('mnemos:'),
  'memory:write': (actor, action) => action.startsWith('memory:') || action.startsWith('mnemos:'),
  'governance:evaluate': (actor, action) => action.startsWith('lumen:'),
  'audit:log': (actor, action) => action.startsWith('audit:'),
};

const OUTER_HEXAGON_RULES: Record<string, (actor: string, action: string) => boolean> = {
  'interop:ingest': (actor, action) => action.startsWith('integration:') || action.includes('ingest'),
  'interop:publish': (actor, action) => action.startsWith('integration:') || action.includes('publish'),
  'territorial:control': (actor, action) => action.startsWith('kernel:resonance') || action.includes('territorial'),
  'signal:ingest': (actor, action) => action.startsWith('orion:') || action.startsWith('sophia:'),
};

function validateInnerHexagon(actor: string, action: string): { valid: boolean; violatedRules: string[] } {
  const violatedRules: string[] = [];
  let anyMatch = false;

  for (const [ruleName, check] of Object.entries(INNER_HEXAGON_RULES)) {
    if (check(actor, action)) {
      anyMatch = true;
    }
  }

  // If no inner rule matched, check if action is strictly inner-hexagon
  const isInnerAction = action.startsWith('identity:') || action.startsWith('kernel:') ||
    action.startsWith('memory:') || action.startsWith('mnemos:') ||
    action.startsWith('lumen:') || action.startsWith('audit:');

  if (isInnerAction && !anyMatch) {
    violatedRules.push('No inner hexagon rule matched for this action');
  }

  return { valid: violatedRules.length === 0, violatedRules };
}

function validateOuterHexagon(actor: string, action: string): { valid: boolean; violatedRules: string[] } {
  const violatedRules: string[] = [];
  let anyMatch = false;

  for (const [ruleName, check] of Object.entries(OUTER_HEXAGON_RULES)) {
    if (check(actor, action)) {
      anyMatch = true;
    }
  }

  // If no outer rule matched, check if action is strictly outer-hexagon
  const isOuterAction = action.startsWith('integration:') || action.includes('ingest') ||
    action.includes('publish') || action.includes('territorial') ||
    action.startsWith('orion:') || action.startsWith('sophia:');

  if (isOuterAction && !anyMatch) {
    violatedRules.push('No outer hexagon rule matched for this action');
  }

  return { valid: violatedRules.length === 0, violatedRules };
}

export function validateHexagon(input: HexagonInput, traceId: string): HexagonResult {
  const auditId = `hex-${Date.now()}-${traceId.slice(0, 8)}`;
  const inner = validateInnerHexagon(input.actor, input.action);
  const outer = validateOuterHexagon(input.actor, input.action);

  const allViolations = [...inner.violatedRules, ...outer.violatedRules];
  const allowed = inner.valid && outer.valid;

  let decision: string;
  let rationale: string;

  if (allowed) {
    decision = 'PERMITIDO';
    rationale = 'Ambos hexágonos validados correctamente. Acción autorizada.';
  } else if (inner.violatedRules.length > 0 && outer.violatedRules.length > 0) {
    decision = 'BLOQUEADO';
    rationale = `Violación en ambos hexágonos: ${allViolations.join('; ')}`;
  } else if (inner.violatedRules.length > 0) {
    decision = 'RESTRINGIDO';
    rationale = `Violación en hexágono interno: ${inner.violatedRules.join('; ')}`;
  } else {
    decision = 'RESTRINGIDO';
    rationale = `Violación en hexágono externo: ${outer.violatedRules.join('; ')}`;
  }

  return { allowed, decision, rationale, auditId, traceId };
}

// ─── Full Security Check ────────────────────────────────────────────────────

export function createISAContext(
  apiKey: string | null,
  bearerToken: string | null,
  action: string,
  traceId: string,
): SecurityResult {
  // 1. Validate API Key
  const apiKeyValid = validateApiKey(apiKey);
  if (!apiKeyValid) {
    return { valid: false, error: 'Invalid or missing API key', statusCode: 401 };
  }

  // 2. Validate Territorial Token
  const tokenResult = validateTerritorialToken(bearerToken);
  if (!tokenResult.valid) {
    return { valid: false, error: tokenResult.error, statusCode: 401 };
  }

  // 3. Validate Double Hexagon
  const hexResult = validateHexagon({
    innerHexagon: {},
    outerHexagon: {},
    actor: tokenResult.payload?.sub as string ?? 'anonymous',
    action,
  }, traceId);

  if (!hexResult.allowed) {
    return { valid: false, error: `Hexagon denied: ${hexResult.rationale}`, statusCode: 403 };
  }

  // 4. Build ISA Context
  const ctx: ISAContext = {
    traceId,
    userId: (tokenResult.payload?.sub as string) ?? 'anonymous',
    sessionId: (tokenResult.payload?.session_id as string) ?? `sess-${Date.now()}`,
    territoryId: (tokenResult.payload?.territory_id as string) ?? 'rdm',
    federations: (tokenResult.payload?.federations as string[]) ?? ['all'],
    timestamp: new Date(),
    apiKeyValidated: true,
    tokenValidated: true,
    hexagonValidated: true,
  };

  return { valid: true, ctx };
}

// ─── Trace ID Generator ─────────────────────────────────────────────────────

export function generateTraceId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 10);
  return `isa-${timestamp}-${random}`;
}

// ─── Error Response Builder ─────────────────────────────────────────────────

export function buildErrorResponse(
  code: string,
  message: string,
  traceId: string,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
): { status: number; body: { code: string; message: string; severity: string; trace_id: string } } {
  const statusMap: Record<string, number> = {
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    VALIDATION_ERROR: 400,
    INTERNAL_ERROR: 500,
    HEXAGON_DENIED: 403,
  };

  return {
    status: statusMap[code] ?? 500,
    body: { code, message, severity, trace_id: traceId },
  };
}
