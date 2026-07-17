import { createStripe, safeError } from "../_shared/stripe.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvoiceRequest {
  customerEmail: string;
  amount: number;
  currency?: string;
  description: string;
  dueDays?: number;
  metadata?: Record<string, string>;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const stripe = createStripe();

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) throw new Error("Not authenticated");

    let body: InvoiceRequest;
    try {
      body = await req.json();
      if (!body.customerEmail || !body.amount || !body.description) throw new Error();
    } catch {
      return new Response(JSON.stringify({ error: "customerEmail, amount, and description required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const customers = await stripe.customers.list({ email: body.customerEmail, limit: 1 });
    let customerId = customers.data[0]?.id;
    if (!customerId) {
      const c = await stripe.customers.create({ email: body.customerEmail, metadata: { created_by: user.id } });
      customerId = c.id;
    }

    const dueDays = body.dueDays || 30;
    const invoice = await stripe.invoices.create({
      customer: customerId,
      collection_method: "send_invoice",
      days_until_due: dueDays,
      metadata: { ...body.metadata, created_by: user.id },
    });

    await stripe.invoiceItems.create({
      customer: customerId,
      invoice: invoice.id,
      amount: Math.round(body.amount * 100),
      currency: (body.currency || "mxn").toLowerCase(),
      description: body.description,
    });

    const finalized = await stripe.invoices.finalizeInvoice(invoice.id);

    return new Response(
      JSON.stringify({
        invoiceId: finalized.id,
        number: finalized.number,
        hostedUrl: finalized.hosted_invoice_url,
        pdfUrl: finalized.invoice_pdf,
        amountDue: finalized.amount_due,
        currency: finalized.currency,
        status: finalized.status,
        dueDate: new Date(finalized.due_date * 1000).toISOString(),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return safeError(e);
  }
});
