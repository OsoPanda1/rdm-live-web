import Stripe from "stripe";

let stripeInstance: Stripe | null = null;
let mppInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    stripeInstance = new Stripe(key, { apiVersion: "2025-06-30.basil" });
  }
  return stripeInstance;
}

export function getMppStripe(): Stripe {
  if (!mppInstance) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    mppInstance = new Stripe(key, { apiVersion: "2026-03-04.preview" });
  }
  return mppInstance;
}

export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string,
  secret: string,
): Stripe.Event {
  return getStripe().webhooks.constructEvent(payload, signature, secret);
}
