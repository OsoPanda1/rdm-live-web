import { writeAudit, getAuditLog } from '@/lib/security/audit';
import { handleApiError, apiResponse, badRequest, unauthorized } from '@/lib/security/error-handler';
import { createRateLimitMiddleware } from '@/lib/security/rate-limiter';

const rateLimit = createRateLimitMiddleware({ maxTokens: 30, refillRate: 1, refillIntervalMs: 1000 });

export async function POST(req: Request) {
  try {
    const reject = rateLimit('audit-write');
    if (reject) return reject;

    const body = await req.json();
    const { actionType, actorId, targetType, targetId, federationId, skillId, decision, rationale, metadata, severity } = body;

    if (!actionType || !actorId) {
      return badRequest('Faltan campos requeridos: actionType, actorId');
    }

    const result = writeAudit({
      actionType, actorId, targetType, targetId, federationId, skillId, decision, rationale, metadata, severity: severity ?? 'info',
    });

    return apiResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') ?? '100', 10), 500);
    const entries = getAuditLog(limit);
    return apiResponse({ entries, total: entries.length });
  } catch (error) {
    return handleApiError(error);
  }
}
