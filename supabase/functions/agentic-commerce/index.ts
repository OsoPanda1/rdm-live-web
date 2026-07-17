import { createStripe, safeError } from "../_shared/stripe.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LineItem {
  sku_id: string;
  quantity: number;
}

interface CheckoutRequest {
  sellerProfileId: string;
  currency: string;
  lineItems: LineItem[];
  returnUrl: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const stripe = createStripe();
    let body: CheckoutRequest;
    try {
      body = await req.json();
      if (!body.sellerProfileId || !body.lineItems?.length) throw new Error();
    } catch {
      return new Response(JSON.stringify({ error: "sellerProfileId and lineItems required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      currency: body.currency || "usd",
      line_items: body.lineItems.map((item) => ({
        price_data: {
          currency: body.currency || "usd",
          product_data: { name: `SKU: ${item.sku_id}` },
          unit_amount: 100,
        },
        quantity: item.quantity,
      })),
      payment_intent_data: {
        metadata: { source: "agentic_commerce", seller_profile: body.sellerProfileId },
      },
      success_url: `${body.returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: body.returnUrl,
    });

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return safeError(e);
  }
});
