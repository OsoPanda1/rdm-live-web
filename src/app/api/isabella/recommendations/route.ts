import { z } from 'zod';
import { createTraceId } from "@/core/context/trace";
import { getLastDecision } from "@/lib/isabella";
import { runRealitoKernel } from "@/lib/kernel";
import { withSpan } from "@/instrumentation.node";
import { validate } from '@/lib/validation';
import { handleApiError, apiResponse } from '@/lib/security/error-handler';

const recSchema = z.object({
  query: z.string().max(500).default(''),
  territory: z.string().max(50).default('RDM'),
  traceId: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const data = validate(recSchema, body);
    const decision = getLastDecision();
    const traceId = data.traceId ?? decision?.traceId ?? createTraceId();

    const response = await withSpan(
      "isabella.recommendations",
      () => {
        const result = runRealitoKernel(data.query, decision ?? undefined);
        return { traceId, territory: data.territory, decision, ...result };
      },
      { traceId, territory: data.territory },
    );

    return apiResponse(response);
  } catch (error) {
    return handleApiError(error);
  }
}
