# Parche 05 — CSP + HSTS en Vercel (Fase 6, riesgo alto)

Añade `Content-Security-Policy` y `Strict-Transport-Security` al `vercel.json`. Sin CSP, un XSS en cualquier renderer (`react-markdown`, comentarios de foro, contenido de Isabella) escala a robo de sesión Supabase inmediato.

---

## Archivo: `vercel.json`

- **Problema:** hay `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` — pero **no** CSP ni HSTS.
- **Impacto:** un solo XSS reflejado o almacenado escala a robo total de sesión y credenciales de terceros (Stripe, Google).
- **Riesgo:** **alto**.
- **Solución:** allowlist estricto para `script-src`, `connect-src`, `frame-src`; HSTS con `preload`.
- **Motivo:** defensa en profundidad. Aunque salga un XSS, el atacante no puede exfiltrar a `evil.com` porque `connect-src` bloquea.
- **Resultado esperado:** `securityheaders.com` califica el dominio con **A** o mejor.
- **Efectos secundarios / QA:** primera iteración va en **Report-Only** por 48 h para detectar recursos que estén cargándose sin querer. Después promover a enforcement.

```diff
--- a/vercel.json
+++ b/vercel.json
@@
   "headers": [
     {
       "source": "/(.*)",
       "headers": [
         { "key": "X-Frame-Options", "value": "DENY" },
         { "key": "X-Content-Type-Options", "value": "nosniff" },
         { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
-        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=(self)" }
+        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=(self), interest-cohort=()" },
+        { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" },
+        {
+          "key": "Content-Security-Policy-Report-Only",
+          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com https://app.posthog.com https://*.vercel-scripts.com https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https://*.supabase.co https://*.tile.openstreetmap.org https://*.google.com https://*.googleusercontent.com https://*.gstatic.com; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://app.posthog.com https://*.ingest.sentry.io https://*.tile.openstreetmap.org https://api.mapbox.com https://generativelanguage.googleapis.com; frame-src 'self' https://js.stripe.com https://hooks.stripe.com; media-src 'self' blob: https://*.supabase.co; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self' https://checkout.stripe.com; frame-ancestors 'none'; upgrade-insecure-requests; report-uri https://<tu-project>.ingest.sentry.io/api/<project-id>/security/?sentry_key=<key>"
+        }
       ]
     }
   ]
```

---

## Plan de rollout (2 pasos, no aplicar de golpe)

### Paso 1 (aplicar ahora): CSP en Report-Only

El header `Content-Security-Policy-Report-Only` **NO bloquea nada** — solo reporta violaciones a Sentry. Deja correr 48-72 h en producción y revisa `Security` events en Sentry.

### Paso 2 (después de revisar reportes): CSP en enforcement

Una vez que Sentry no reporte violaciones legítimas por 48 h:

```diff
-        { "key": "Content-Security-Policy-Report-Only", "value": "..." }
+        { "key": "Content-Security-Policy", "value": "..." }
```

Mantener el `report-uri` para detectar futuras regresiones.

---

## Ajustes por integraciones

Revisa la CSP arriba y **elimina** dominios que no uses, o **añade** los que uses:

| Servicio | Directiva a extender |
|----------|----------------------|
| Mapbox   | `connect-src https://api.mapbox.com https://events.mapbox.com; img-src https://api.mapbox.com` |
| Google Maps | `script-src https://maps.googleapis.com; img-src https://*.googleapis.com` |
| YouTube embeds | `frame-src https://www.youtube.com https://www.youtube-nocookie.com` |
| Vimeo embeds | `frame-src https://player.vimeo.com` |
| Cloudflare Turnstile | `script-src https://challenges.cloudflare.com; frame-src https://challenges.cloudflare.com` |

---

## Checklist post-aplicación

- [ ] Deploy con `Report-Only` durante 48-72 h.
- [ ] Revisar `Sentry → Security` reports; corregir CSP para recursos legítimos.
- [ ] Cambiar a `Content-Security-Policy` (enforcement).
- [ ] `curl -I https://www.visitarealdelmonte.online | grep -i security` muestra ambos headers.
- [ ] `securityheaders.com` → **A** o mejor.
- [ ] `hstspreload.org` → domain elegible (opcional, tras 1-2 semanas estables).
