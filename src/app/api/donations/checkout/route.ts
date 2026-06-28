import { logger } from "@/lib/logger";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const amount = typeof body.amount === "number" && body.amount > 0 ? body.amount : 100;

    logger.info("[DONATIONS] Checkout solicitado", { amount });

    const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
    const BASE_URL = process.env.BASE_URL ?? "https://realdelmonte.digital";

    if (STRIPE_SECRET_KEY) {
      // @ts-expect-error - stripe may not be installed
      const stripe = await import("stripe");
      const client = new stripe.default(STRIPE_SECRET_KEY);
      const session = await client.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [{ price_data: { currency: "mxn", product_data: { name: "Donación RDM Digital" }, unit_amount: amount * 100 }, quantity: 1 }],
        mode: "payment",
        success_url: `${BASE_URL}/gracias-donativo?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${BASE_URL}/donar`,
      });

      return Response.json({ url: session.url });
    }

    return Response.json({ url: `${BASE_URL}/gracias-donativo` });
  } catch (error) {
    logger.error("[DONATIONS] Error en checkout", error);
    return Response.json({ url: "/gracias-donativo" });
  }
}