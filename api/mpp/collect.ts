import { getMppStripe } from "../_shared/stripe.js";
import { handleCors } from "../_shared/cors.js";

interface CollectRequestBody {
  paymentIntentId?: unknown;
}

/**
 * Utilidad centralizada para estandarizar respuestas JSON con cabeceras de seguridad.
 */
function jsonResponse(data: unknown, status = 200, headers: HeadersInit = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...headers,
    },
  });
}

export default async function handler(req: Request): Promise<Response> {
  const cors = handleCors(req);
  if (cors) return cors;

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405, {
      Allow: "POST",
    });
  }

  let body: CollectRequestBody;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON payload" }, 400);
  }

  const { paymentIntentId } = body;

  // Validación estricta: tipo string y formato inicial de Stripe Intent (pi_)
  if (
    typeof paymentIntentId !== "string" ||
    !paymentIntentId.trim() ||
    !paymentIntentId.trim().startsWith("pi_")
  ) {
    return jsonResponse({ error: "Valid paymentIntentId required" }, 400);
  }

  const sanitizedIntentId = paymentIntentId.trim();

  try {
    const stripe = getMppStripe();
    const intent = await stripe.paymentIntents.retrieve(sanitizedIntentId);

    if (intent.status !== "succeeded") {
      return jsonResponse(
        { 
          error: "Payment not completed", 
          status: intent.status 
        },
        402
      );
    }

    return jsonResponse({
      ok: true,
      resource: intent.id,
      receipt: {
        id: intent.id,
        amount: intent.amount,
        currency: intent.currency,
        status: intent.status,
        created: intent.created,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return jsonResponse({ error: message }, 500);
  }
}
