import { unifiedSDK } from '@/core/unified/UnifiedSDK';
import { validate, querySchema } from '@/lib/validation';
import { handleApiError, apiResponse } from '@/lib/security/error-handler';
import { cache } from '@/lib/cache';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = validate(querySchema, body);

    const cacheKey = `query:${data.userId}:${data.text.slice(0, 50)}`;
    const cached = await cache.get(cacheKey);
    if (cached) return apiResponse(cached);

    const result = await unifiedSDK.queryTerritory(data.text, data.userId, data.coords);
    await cache.set(cacheKey, result, 30_000);

    return apiResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}
