# Parche 03 — Stripe hardening (Fase 4, riesgo alto)

Verificación de firma en webhooks, idempotencia por `event.id`, sanitización de errores y allowlist de origins. Cubre las 6 edge functions relacionadas con Stripe.

---

## Archivo nuevo: `supabase/functions/_shared/stripe.ts`

- **Problema:** no existe helper compartido; cada función Stripe reimplementa (mal) la verificación.
- **Impacto:** duplicación → alguna función olvidará `constructEventAsync` y aceptará webhooks falsificados.
- **Riesgo:** **alto**.
- **Solución:** helper único con verify + idempotencia + `safeError`.
- **Resultado esperado:** una sola línea `await verifyStripeEvent(req)` por edge.

```ts
// supabase/functions/_shared/stripe.ts
import Stripe from "https://esm.sh/stripe@16.12.0?target=denonext";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2024-11-20.acacia",
  httpClient: Stripe.createFetchHttpClient(),
});

export async function verifyStripeEvent(req: Request): Promise<Stripe.Event> {
  const sig = req.headers.get("stripe-signature");
  const secret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!sig || !secret) throw new Response("missing signature", { status: 400 });
  const body = await req.text();
  try {
    return await stripe.webhooks.constructEventAsync(body, sig, secret, undefined, Stripe.createSubtleCryptoProvider());
  } catch (err) {
    console.error("[stripe] invalid signature", (err as Error).message);
    throw new Response("invalid signature", { status: 400 });
  }
}

/** Idempotencia: retorna true si ya procesamos ese event.id */
export async function alreadyProcessed(eventId: string): Promise<boolean> {
  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data } = await admin.from("stripe_events").select("id").eq("id", eventId).maybeSingle();
  if (data) return true;
  await admin.from("stripe_events").insert({ id: eventId, processed_at: new Date().toISOString() });
  return false;
}

export function safeError(err: unknown): Response {
  const message = err instanceof Error ? err.message : "internal_error";
  // NO devolver stack. Loguear server-side, responder genérico.
  console.error("[stripe] handler error", err);
  return new Response(JSON.stringify({ error: "internal_error", ref: crypto.randomUUID() }), {
    status: 500,
    headers: { "content-type": "application/json" },
  });
}

export { stripe };
```

---

## Migración nueva: `supabase/migrations/20260701000000_stripe_events_idempotency.sql`

```sql
CREATE TABLE IF NOT EXISTS public.stripe_events (
  id text PRIMARY KEY,
  processed_at timestamptz NOT NULL DEFAULT now()
);

-- No user access — solo service_role escribe/lee desde edge functions
GRANT ALL ON public.stripe_events TO service_role;

ALTER TABLE public.stripe_events ENABLE ROW LEVEL SECURITY;
-- Sin policies para authenticated/anon = acceso 0 desde Data API. Correcto.

CREATE INDEX IF NOT EXISTS stripe_events_processed_at_idx
  ON public.stripe_events (processed_at DESC);

-- Limpieza automática de eventos > 90 días (opcional, requiere pg_cron)
-- SELECT cron.schedule('purge-stripe-events', '0 3 * * *',
--   $$DELETE FROM public.stripe_events WHERE processed_at < now() - interval '90 days'$$);
```

---

## Archivo: `supabase/functions/stripe-webhook/index.ts`

- **Problema:** posiblemente no verifica firma o lo hace con `constructEvent` sync (falla en Deno).
- **Impacto:** cualquiera envía `checkout.session.completed` fake → marca pedidos como pagados.
- **Riesgo:** **crítico**.
- **Solución:** usar el helper compartido.

```diff
--- a/supabase/functions/stripe-webhook/index.ts
+++ b/supabase/functions/stripe-webhook/index.ts
@@
-import Stripe from "https://esm.sh/stripe@16.12.0";
-
-serve(async (req) => {
-  const body = await req.text();
-  const event = JSON.parse(body); // ← INSEGURO
-  // ...
-});
+import { verifyStripeEvent, alreadyProcessed, safeError } from "../_shared/stripe.ts";
+
+Deno.serve(async (req) => {
+  if (req.method !== "POST") return new Response("method not allowed", { status: 405 });
+  try {
+    const event = await verifyStripeEvent(req);
+    if (await alreadyProcessed(event.id)) {
+      return new Response(JSON.stringify({ ok: true, duplicate: true }), { status: 200 });
+    }
+    switch (event.type) {
+      case "checkout.session.completed": {
+        const session = event.data.object as import("https://esm.sh/stripe@16.12.0").Stripe.Checkout.Session;
+        // ... lógica de negocio (marcar pedido pagado, enviar email, etc.)
+        break;
+      }
+      case "customer.subscription.updated":
+      case "customer.subscription.deleted":
+        // ... handlers específicos
+        break;
+      default:
+        console.log("[stripe] unhandled event", event.type);
+    }
+    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "content-type": "application/json" } });
+  } catch (err) {
+    if (err instanceof Response) return err;
+    return safeError(err);
+  }
+});
```

---

## Aplicar el mismo patrón a las otras 5 edge functions Stripe

| Función | Cambio requerido |
|---------|------------------|
| `create-checkout` | Import `safeError`; validar `origin` contra allowlist; nunca devolver `err.stack`. |
| `create-portal-session` | Idem + `requireSupabaseAuth` (rechazar 401 si no hay `user.id`). |
| `cancel-subscription` | Idem + confirmar `subscription.customer === user.stripe_customer_id`. |
| `create-payment-intent` | Idem. |
| `refund` | Idem + role check (`has_role(user_id, 'admin')`). |

- **Efectos secundarios / QA:** con Stripe CLI: `stripe listen --forward-to https://<proyecto>.supabase.co/functions/v1/stripe-webhook` y `stripe trigger checkout.session.completed`. Verificar log del segundo trigger (mismo evento): debe responder `{ ok: true, duplicate: true }`.

---

## Checklist post-aplicación

- [ ] `STRIPE_WEBHOOK_SECRET` presente en Supabase Edge Function Secrets.
- [ ] Migración `20260701000000_stripe_events_idempotency.sql` aplicada.
- [ ] Test Stripe CLI: evento fake con firma inválida → **400**.
- [ ] Test Stripe CLI: mismo evento reenviado → segundo response indica `duplicate: true`.
- [ ] `rg 'err.stack|error.message' supabase/functions/` en respuestas HTTP: 0 hits.
