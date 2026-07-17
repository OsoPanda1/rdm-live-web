import { unifiedSDK } from '@/core/unified/UnifiedSDK';
import { validate, contributionSchema } from '@/lib/validation';
import { handleApiError, apiResponse } from '@/lib/security/error-handler';
import { createRateLimitMiddleware } from '@/lib/security/rate-limiter';
import { cache } from '@/lib/cache';
import { enqueue } from '@/lib/jobs';

const rateLimit = createRateLimitMiddleware({ maxTokens: 20, refillRate: 1, refillIntervalMs: 1000 });

export async function POST(req: Request) {
  try {
    const reject = rateLimit('contribute');
    if (reject) return reject;

    const body = await req.json();
    const data = validate(contributionSchema, body);

    const cacheKey = `contrib:${data.userId}:${Date.now()}`;
    const cached = await cache.get(cacheKey);
    if (cached) return apiResponse(cached);

    const result = unifiedSDK.recordContribution(data.userId, data.type, data.coords, data.territorio, data.payload, data.poiId);

    await cache.set(cacheKey, result, 5000);

    enqueue('territorial:heatmap-update', { zone: data.territorio }, 0);

    return apiResponse(result, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
