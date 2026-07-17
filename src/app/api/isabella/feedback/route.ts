import { consentEvents, reviews, reviewsScore } from "@/infra/metrics/prometheus";
import { validate, feedbackSchema } from '@/lib/validation';
import { handleApiError, apiResponse } from '@/lib/security/error-handler';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = validate(feedbackSchema, body);

    if (data.rating !== null) {
      const type = data.rating >= 4 ? "positive" : data.rating <= 2 ? "negative" : "neutral";
      reviews.inc({ territory: data.territory, type });
      reviewsScore.observe(data.rating);
    }
    if (data.consent !== null) {
      consentEvents.inc({ territory: data.territory, status: data.consent ? "granted" : "denied" });
    }

    return apiResponse({ ok: true, ...data });
  } catch (error) {
    return handleApiError(error);
  }
}
