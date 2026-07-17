# RDM Digital LTOS — Postura de Seguridad

## Modelo
- **Frontend**: React/Vite SPA servida por Lovable hosting (HTTPS forzado, CDN).
- **Backend**: Supabase Postgres + Edge Functions (Deno).
- **Auth**: JWT bearer en `Authorization` header (no cookies de sesión).

## Controles activos
- **RLS** en todas las tablas `public.*` con políticas explícitas por rol.
- **GRANT** explícitos por tabla; `anon` sólo en lectura pública intencional.
- **CSP** declarada vía `<meta http-equiv="Content-Security-Policy">` en `index.html`.
- **HSTS** aplicado por el hosting de Lovable (no requiere meta tag).
- **Referrer-Policy** + **Permissions-Policy** declarados en HTML.
- **Validación de inputs** con Zod en formularios (RegistrarComercio, ratings).
- **Rate-limit** ad-hoc en memoria por edge function (60 req/min/IP) — aceptado como mitigación parcial hasta contar con infraestructura dedicada.
- **CORS** restrictivo en edge functions sensibles.

## CSRF
No aplica: el stack usa **JWT bearer** (no cookies), por lo que el ataque CSRF clásico (forjar requests con la cookie de sesión del usuario) no es viable. Documentado intencionalmente.

## Pagos
- Stripe Checkout en modo redirect (PCI handling delegado).
- Webhooks firmados (`STRIPE_WEBHOOK_SECRET`).
- `verify_jwt = false` solo en `stripe-webhook` y endpoints públicos de ingest/metrics.

## Auditoría
- `tracking_events` y `federation_health_log` persisten bitácora.
- `system_alerts` registra umbrales excedidos.
- Linter Supabase ejecutado tras cada migración.

## Post-Quantum Cryptography (PQC)
- **Implementado**: `PostQuantumCryptoV2` en `src/quantum/pqc.ts`
- **Kyber KEM** para intercambio de claves resistente a ataques cuánticos
- **Dilithium** para firmas digitales post-cuánticas
- **Dual provider**: liboqs WASM (cuando disponible) → fallback Web Crypto API
- **Inicialización lazy**: `initPQC()` retorna estado del proveedor activo

## Cloudflare / WAF Strategy
- **Próximo**: WAF gestionado vía Cloudflare o Vercel Firewall
- **Rate-limit global**: migrar de memoria local a Vercel KV o Cloudflare Rate Limiting
- **DDoS protection**: habilitar en capa CDN (Vercel Edge Network o Cloudflare)
- **Bot management**: Vercel Bot-Fighting o Cloudflare Bot Management
- **Web Application Firewall**: reglas OWASP CRS en Cloudflare

## Limitaciones conocidas (pre-producción real)
- Rate-limit es por instancia de edge function (memoria local), no global.
- PQC WASM: depende de disponibilidad de CDN para binario `.wasm`
