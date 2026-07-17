import { getMppStripe } from "../_shared/stripe";
import { handleCors } from "../_shared/cors";

export default async function handler(req: Request) {
  const cors = handleCors(req);
  if (cors) return cors;

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: { paymentIntentId?: string };
  try {
    body = await req.json();
    if (!body.paymentIntentId) throw new Error();
  } catch {
    return new Response(JSON.stringify({ error: "paymentIntentId required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const stripe = getMppStripe();
    const intent = await stripe.paymentIntents.retrieve(body.paymentIntentId);

    if (intent.status !== "succeeded") {
      return new Response(JSON.stringify({ error: "Payment not completed", status: intent.status }), {
        status: 402,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({
        ok: true,
        resource: body.paymentIntentId,
        receipt: {
          id: intent.id,
          amount: intent.amount,
          currency: intent.currency,
          status: intent.status,
          created: intent.created,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
