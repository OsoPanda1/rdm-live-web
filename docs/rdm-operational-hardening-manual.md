# Manual extremo RDM Digital — versión final unificada

Este manual es norma obligatoria para Lovable, CODEX, equipo técnico y cualquier contribuidor. Su objetivo es transformar RDM Digital de prototipo avanzado a infraestructura institucional lista para producción pública sobre Vercel + Supabase.

## Objetivo global

Alcanzar al menos **95% de madurez operativa por dominio** antes de considerar el sistema apto para producción pública, carga real o auditorías serias.

## Veredicto operativo

- El monorepo tiene una visión y arquitectura por encima de la media de proyectos generados con Lovable.
- La implementación debe tratarse como **prototipo avanzado** hasta completar los bloqueantes P0 y los controles de seguridad en Vercel.
- La brecha crítica está entre “funciona y se ve bien” y “resiste carga, ataques, errores y auditoría”.

## Orden absoluto de ejecución

Ningún contribuidor debe saltarse este orden:

1. **P0:** pruebas y seguridad básica.
2. **P0/P1:** eventos, integridad de datos y observabilidad.
3. **P2:** Supabase endurecido y RLS sin agujeros.
4. **Vercel + Supabase:** despliegue protegido, staging y controles de borde.
5. **P3:** performance y accesibilidad.
6. **P2 arquitectura:** gobernanza de alcance y dominios.

## P0 — bloqueantes de producción

### P0-01 Cobertura de pruebas

Norma mínima:

- Cobertura objetivo: **≥80%** en autenticación, integraciones Supabase, flujos IA, formularios críticos, rutas principales y panel admin.
- Vitest debe cubrir módulos de auth, hooks, servicios y componentes core.
- Playwright debe cubrir login, flujos RDM, panel admin y escenarios de error.
- Las pruebas E2E no pueden quedar en modo permisivo en CI.

### P0-02 Service Role

Norma:

- `SUPABASE_SERVICE_ROLE_KEY` jamás debe estar disponible para código cliente ni empaquetarse en bundles web.
- El cliente admin de Supabase debe vivir solo en módulos `*.server.ts`, funciones edge o infraestructura server-only.
- ESLint debe bloquear imports server-only desde frontend.
- La llave debe vivir en variables protegidas de Vercel/Vault, nunca en código fuente.

### P0-03 Vercel

Norma:

- Debe existir configuración formal de Vercel deployment.
- Deben existir entornos separados de preview/staging y production.
- Secrets se configuran en Vercel dashboard → Project Settings → Environment Variables; nunca se versionan.

### P0-04 Observabilidad

Norma:

- Sentry debe capturar errores de frontend y backend e integrarse con ErrorBoundary.
- PostHog debe capturar eventos de uso, funnels y retención.
- OpenTelemetry debe cubrir trazas, logs estructurados y métricas cuando exista backend/edge estable.
- `console.*` directo queda prohibido en producción salvo dentro del logger central.

## P1 — riesgos altos

### P1-01 `any`

- `any` queda prohibido en código crítico de dominio: auth, IA, economía, gemelo territorial y administración.
- Usar tipos específicos, `unknown` con validación, Zod o tipos generados.
- Toda excepción debe tener comentario de justificación y alcance.

### P1-02 Logging

- Usar un logger central con niveles `debug`, `info`, `warn`, `error`.
- Backend/edge debe emitir logs estructurados JSON.
- Producción debe reducir ruido y preservar trazabilidad.

### P1-03 Playwright

- Login, intro de fases, panel RDM, errores Supabase e IA deben estar en E2E.
- CI debe bloquear PR si E2E falla.

### P1-04 Escaneo de secretos

- Gitleaks y TruffleHog deben ejecutarse en PR.
- `npm audit` o herramienta equivalente debe bloquear vulnerabilidades altas/críticas sin justificación.

## P2 — arquitectura, Supabase, SEO e IA

### Arquitectura

- Definir MVP real antes de expandir dominios.
- Congelar nuevos dominios hasta endurecer IA, economía, analytics, cultura, sensores y gemelo territorial existentes.

### Supabase

- Revisar todas las políticas RLS y eliminar `USING (true)` salvo justificación pública explícita.
- Sustituir whitelists de correos administrativos por roles y autenticación fuerte.
- Añadir rate limiting, moderación, antispam y CAPTCHA (Turnstile o hCaptcha) en formularios expuestos.

### SEO

- Mantener `robots.txt` y sitemap dinámico.
- Implementar JSON-LD `TouristDestination`, `LocalBusiness`, `FAQPage`, `Event` y `Article` según contexto.

### IA

- Sanitizar inputs antes de enviarlos a modelos.
- Limitar tokens, frecuencia y campos enviados a IA.
- Auditar prompts/respuestas de forma segura, sin exponer datos personales ni secretos.

## P3 — performance y accesibilidad

### Performance

- Lazy loading para vistas con `three`, `@react-three/fiber`, `@react-three/drei`, `leaflet` y `recharts`.
- Medir bundle inicial, TTI y LCP.

### Accesibilidad

- Ejecutar Lighthouse y Axe.
- Corregir contraste, labels, focus management, navegación por teclado y roles ARIA.

## Checklist Vercel obligatorio

- DNS en zona Vercel con registros correctos.
- Proyecto conectado al repositorio con preview/staging y production.
- Rate limiting por IP/ruta (Vercel WAF o middleware).
- CSP estricta en vercel.json.
- HSTS habilitado en vercel.json.
- PostHog para analytics.
- Sentry frontend/backend.
- Staging separado para pruebas y chaos.

## Regla final

Mientras estos puntos no estén ejecutados y verificados, RDM Digital debe declararse **prototipo avanzado de alto potencial y riesgo alto**. Cuando estén ejecutados, el sistema puede considerarse infraestructura endurecida apta para producción institucional.
