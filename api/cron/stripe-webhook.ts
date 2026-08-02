export const config = { runtime: "nodejs" };

import { getCorsHeaders } from "../_shared/cors.js";
import { verifyWebhookSignature } from "../_shared/stripe.js";

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const sig = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return new Response(JSON.stringify({ error: "missing_signature" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  try {
    const body = await req.text();

    const event = verifyWebhookSignature(body, sig, webhookSecret);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as { customer?: string; subscription?: string; metadata?: Record<string, string> };
        console.log("[stripe-webhook] checkout completed", session.customer, session.metadata);
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as { id?: string; status?: string };
        console.log("[stripe-webhook] subscription", sub.status, sub.id);
        break;
      }
      default:
        console.log("[stripe-webhook] unhandled event", event.type);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (err) {
    console.error("[stripe-webhook] error", err);
    return new Response(JSON.stringify({ error: "webhook_error" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }
}
