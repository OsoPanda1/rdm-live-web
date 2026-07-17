import { getMppStripe } from "../_shared/stripe";
import { handleCors } from "../_shared/cors";
import { checkRateLimit } from "../_shared/rate-limit";

interface Payload {
  amount: number;
  currency?: string;
  resourceId?: string;
  description?: string;
}

export default async function handler(req: Request) {
  const cors = handleCors(req);
  if (cors) return cors;

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  const rl = checkRateLimit(`mpp:${req.headers.get("x-forwarded-for") || "unknown"}`, 30, 60_000);
  if (!rl.allowed) {
    return new Response(JSON.stringify({ error: "Rate limited" }), {
      status: 429,
      headers: { "Content-Type": "application/json", "Retry-After": "2" },
    });
  }

  let payload: Payload;
  try {
    payload = await req.json();
    if (!payload.amount || payload.amount <= 0) throw new Error();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid payload" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const amountInCents = Math.round(payload.amount * 100);
  const currency = (payload.currency || "usd").toLowerCase();

  const stripe = getMppStripe();

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency,
      payment_method_types: ["card", "link"],
      metadata: {
        source: "mpp",
        resource_id: payload.resourceId || "",
        description: payload.description || "Machine payment",
      },
    });

    return new Response(
      JSON.stringify({
        status: 402,
        title: "Payment Required",
        detail: "Send payment to access this resource",
        challenge: {
          clientSecret: paymentIntent.client_secret,
          amount: amountInCents,
          currency,
        },
      }),
      {
        status: 402,
        headers: {
          "Content-Type": "application/json",
          "WWW-Authenticate": `Payment id="${paymentIntent.id}", method="stripe", intent="charge"`,
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
