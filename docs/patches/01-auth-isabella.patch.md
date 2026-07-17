# Parche 01 — Auth + Isabella AI (Fase 2, riesgo crítico)

Cierra el bypass de autenticación en `isabella-ai`, saca `GEMINI_API_KEY` del bundle del cliente y estandariza el naming a un único secret server-side. **Aplicar antes que cualquier otro parche que toque IA.**

---

## Archivo: `supabase/functions/isabella-ai/index.ts`

- **Problema:** el handler acepta cualquier token (o token inválido) porque hace `userId = userData?.user?.id ?? "anonymous"`. Además usa `GOOGLE_GENAI_API_KEY` mientras `.env.example` declara `VITE_GEMINI_API_KEY` y `wrangler.toml` habla de `GEMINI_API_KEY`.
- **Impacto:** cualquier request con `Authorization: Bearer foo` consume créditos de Gemini a tu nombre. En prod la función falla en silencio (`responseText = ""`) cuando el deploy usa otro nombre de secret.
- **Riesgo:** **crítico**.
- **Solución:** rechazar con 401 si `userData?.user?.id` es falsy; leer el secret desde una única variable `GEMINI_API_KEY`; validar Origin contra allowlist antes de responder.
- **Motivo:** cerrar la puerta trasera anónima y eliminar el drift de naming que genera fallas silenciosas.
- **Resultado esperado:** todas las invocaciones tienen `user.id` válido; observabilidad de `401` en logs; no hay consumo anónimo.
- **Efectos secundarios / QA:** verificar que el cliente SIEMPRE llame la función con un JWT vigente (renovar sesión antes de invocar). Probar: (1) request sin header → 401, (2) request con JWT expirado → 401, (3) request con JWT válido → 200.

```diff
--- a/supabase/functions/isabella-ai/index.ts
+++ b/supabase/functions/isabella-ai/index.ts
@@
-const ALLOWED_ORIGINS = ["*"];
+const ALLOWED_ORIGINS = [
+  "https://www.visitarealdelmonte.online",
+  "https://visitarealdelmonte.online",
+  "https://real-del-monte-digital-hub.vercel.app",
+  ...(Deno.env.get("ENV") === "development" ? ["http://localhost:5173", "http://localhost:8080"] : []),
+];
+
+function corsHeaders(origin: string | null) {
+  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
+  return {
+    "Access-Control-Allow-Origin": allowed,
+    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
+    "Access-Control-Allow-Methods": "POST, OPTIONS",
+    "Vary": "Origin",
+  };
+}
@@
-  const authHeader = req.headers.get("Authorization");
-  if (!authHeader) {
-    return new Response(JSON.stringify({ error: "Missing Authorization header" }), { status: 401 });
-  }
+  const origin = req.headers.get("origin");
+  const cors = corsHeaders(origin);
+  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
+
+  const authHeader = req.headers.get("Authorization");
+  if (!authHeader?.startsWith("Bearer ")) {
+    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...cors, "content-type": "application/json" } });
+  }
@@
-  const { data: userData } = await userClient.auth.getUser();
-  const userId = userData?.user?.id ?? "anonymous";
+  const { data: userData, error: authError } = await userClient.auth.getUser();
+  if (authError || !userData?.user?.id) {
+    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...cors, "content-type": "application/json" } });
+  }
+  const userId = userData.user.id;
@@
-  const apiKey = Deno.env.get("GOOGLE_GENAI_API_KEY");
+  const apiKey = Deno.env.get("GEMINI_API_KEY");
+  if (!apiKey) {
+    console.error("[isabella-ai] missing GEMINI_API_KEY secret");
+    return new Response(JSON.stringify({ error: "service_unavailable" }), { status: 503, headers: { ...cors, "content-type": "application/json" } });
+  }
```

---

## Archivo: `.env.example`

- **Problema:** `VITE_GEMINI_API_KEY=AIzaSy...` inyecta la key al bundle browser.
- **Impacto:** cualquier visitante extrae la key desde devtools y consume tu cuota.
- **Riesgo:** **crítico**.
- **Solución:** eliminar el prefijo `VITE_` y añadir comentario prohibitivo.
- **Motivo:** el prefijo `VITE_` es la única forma en que Vite inyecta env al cliente; sin él la variable solo vive server-side.
- **Resultado esperado:** ninguna key de Gemini aparece en el bundle emitido por `vite build`.
- **Efectos secundarios / QA:** rotar la key expuesta en el pasado (asumir compromiso), registrar el nuevo valor en Supabase Edge Function Secrets y en Vercel Project → Environment Variables (scope: Preview + Production).

```diff
--- a/.env.example
+++ b/.env.example
@@
-# Gemini (cliente) — SE INYECTA AL BUNDLE, no usar para llamadas directas
-VITE_GEMINI_API_KEY=AIzaSy_your_key_here
+# Gemini — SERVER-SIDE ONLY. Nunca prefijar con VITE_ (se filtraría al browser).
+# Configurar en: Supabase → Edge Function Secrets → GEMINI_API_KEY
+#            y: Vercel → Settings → Environment Variables → GEMINI_API_KEY
+# GEMINI_API_KEY=AIzaSy_your_key_here   # (no commitear el valor real)
```

---

## Archivo: `src/isabella/**/*` (grep + reemplazo)

- **Problema:** cualquier `import.meta.env.VITE_GEMINI_API_KEY` en el frontend hace llamadas directas a Google.
- **Impacto:** aunque quites el prefijo, el código sigue esperándolo.
- **Riesgo:** **crítico**.
- **Solución:** rutar 100% de las llamadas a Gemini vía `supabase.functions.invoke('isabella-ai', ...)`.
- **Motivo:** el frontend nunca debe tener la key.
- **Resultado esperado:** grep `VITE_GEMINI_API_KEY` en `src/` devuelve 0 resultados.
- **Efectos secundarios / QA:** revisar los hooks `useIsabella`, `useGemini`, y cualquier `new GoogleGenerativeAI(...)` en cliente.

```bash
# Auditoría rápida — debe devolver vacío tras el fix
rg -n 'VITE_GEMINI_API_KEY|new GoogleGenerativeAI' src/
```

---

## Checklist post-aplicación

- [ ] `GEMINI_API_KEY` registrada en Supabase Edge Function Secrets.
- [ ] `GEMINI_API_KEY` registrada en Vercel (Preview + Production).
- [ ] Key vieja rotada en la consola de Google Cloud.
- [ ] `rg VITE_GEMINI_API_KEY` en el repo devuelve 0 hits.
- [ ] Test manual: request a `/functions/v1/isabella-ai` sin `Authorization` → **401**.
- [ ] Test manual: request con JWT válido → **200**.
