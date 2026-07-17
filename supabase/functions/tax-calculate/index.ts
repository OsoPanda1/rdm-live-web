import { safeError } from "../_shared/stripe.ts";
import { calculateTax, getTaxConfig } from "../_shared/tax.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    let body: { amount: number; currency?: string; country?: string; postalCode?: string };
    try {
      body = await req.json();
      if (!body.amount || body.amount <= 0) throw new Error();
    } catch {
      return new Response(JSON.stringify({ error: "amount required (positive number)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const taxConfig = getTaxConfig();
    if (!taxConfig.enabled) {
      return new Response(JSON.stringify({ taxAmount: 0, total: body.amount, breakdown: [] }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await calculateTax(
      Math.round(body.amount * 100),
      body.currency || "mxn",
      body.country ? { address: { country: body.country, postal_code: body.postalCode } } : undefined,
    );

    return new Response(
      JSON.stringify({
        subtotal: body.amount,
        taxAmount: result.taxAmount / 100,
        total: result.total / 100,
        currency: (body.currency || "mxn").toLowerCase(),
        breakdown: result.breakdown,
        automaticTax: taxConfig.automaticTax,
        taxBehavior: taxConfig.taxBehavior,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return safeError(e);
  }
});
