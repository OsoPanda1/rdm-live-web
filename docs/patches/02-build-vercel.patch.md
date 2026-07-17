# Parche 02 — Build estable + target único Vercel (Fase 7, riesgo crítico)

Resuelve la versión fantasma de Vite, elimina el conflicto de lockfiles, quita el `rollupOptions.external` que rompe Sentry/PostHog en runtime, y colapsa el target a Vercel exclusivamente (el usuario ya decidió Vercel como único destino).

---

## Archivo: `package.json`

- **Problema:** `"vite": "^8.1.0"` no existe (Vite estable es 7.x). Además, `lovable-tagger` está en `dependencies` y se publica al bundle.
- **Impacto:** `npm install` en CI limpio resuelve a un RC frágil o falla. Bundle de producción incluye código de desarrollo.
- **Riesgo:** **crítico**.
- **Solución:** anclar `vite ^7.0.0`, mover `lovable-tagger` a `devDependencies`.
- **Motivo:** eliminar dependencias fantasma; separar dev/prod correctamente.
- **Resultado esperado:** `npm ci` funciona sin `--legacy-peer-deps`. Bundle prod pierde ~40KB de `lovable-tagger`.
- **Efectos secundarios / QA:** correr `bun install` local para regenerar `bun.lock`; confirmar que `bun run build` produce artefacto válido.

```diff
--- a/package.json
+++ b/package.json
@@
-    "vite": "^8.1.0",
+    "vite": "^7.0.0",
@@
   "dependencies": {
-    "lovable-tagger": "^1.0.0",
+    "@google/genai": "^0.x.x",     // ← si SOLO se usa en edge, moverlo también a devDependencies o eliminarlo
   },
   "devDependencies": {
+    "lovable-tagger": "^1.0.0",
   }
```

---

## Archivo: `vite.config.ts`

- **Problema:** `rollupOptions.external: [/@sentry\//, /posthog-js/]` en build de SPA browser deja imports sin resolver.
- **Impacto:** en cuanto una página importe Sentry o PostHog, el navegador tira `Failed to resolve module specifier "@sentry/browser"` y la página no renderiza.
- **Riesgo:** **crítico**.
- **Solución:** eliminar el bloque `external`. Dejar que Vite haga bundle de todos los SDK.
- **Motivo:** `external` solo aplica a builds de librería; en una app se rompe el resolver.
- **Resultado esperado:** Sentry/PostHog cargan sin errores en runtime.
- **Efectos secundarios / QA:** el bundle crece ~110KB gz (Sentry ~65KB + PostHog ~45KB). Confirmar con `vite-bundle-visualizer`.

```diff
--- a/vite.config.ts
+++ b/vite.config.ts
@@
   build: {
     chunkSizeWarningLimit: 600,
     rollupOptions: {
-      external: [/@sentry\//, /posthog-js/],
       output: {
         manualChunks: {
           "vendor-three": ["three", "@react-three/fiber", "@react-three/drei"],
           "vendor-map": ["leaflet", "supercluster"],
         },
       },
     },
   },
```

---

## Archivo: `wrangler.toml` (eliminar)

- **Problema:** el proyecto declara dos targets (Cloudflare + Vercel) y ya se decidió Vercel exclusivamente.
- **Impacto:** duplica pipelines de deploy, secrets desincronizados, dominio canónico servido por dos CDNs.
- **Riesgo:** alto (drift silencioso).
- **Solución:** `git rm wrangler.toml` y borrar `.wrangler/`, `worker-configuration.d.ts` si existen.
- **Motivo:** un solo target = una sola fuente de verdad para redirects, headers y env.
- **Resultado esperado:** el deploy en Vercel es el único activo. Registrar dominio canónico solo en Vercel.
- **Efectos secundarios / QA:** en Cloudflare (si tiene DNS del dominio), apuntar registros A/CNAME a Vercel. Confirmar que ningún `.github/workflows/*.yml` sigue llamando `wrangler deploy`.

```bash
git rm wrangler.toml
git rm -f worker-configuration.d.ts 2>/dev/null || true
rm -rf .wrangler
# Buscar referencias residuales
rg -n 'wrangler|cloudflare' .github/ package.json vercel.json 2>/dev/null
```

---

## Archivo: lockfiles

- **Problema:** conviven `bun.lock`, `bun.lockb` (binario obsoleto) y `package-lock.json`. Vercel usa `npm install --legacy-peer-deps` mientras el dev local usa bun.
- **Impacto:** "funciona en mi máquina", drift silencioso de resoluciones.
- **Riesgo:** alto.
- **Solución:** elegir **bun** (ya es el estándar del proyecto), borrar los otros dos.
- **Motivo:** un package manager = un lockfile determinístico.
- **Resultado esperado:** CI de Vercel usa `bun install --frozen-lockfile`.

```bash
git rm package-lock.json bun.lockb
bun install
git add bun.lock
```

---

## Archivo: `vercel.json`

- **Problema:** `installCommand: "npm install --legacy-peer-deps"` enmascara conflictos de peer deps.
- **Impacto:** dependencias con incompatibilidades silenciosas llegan a producción.
- **Riesgo:** alto.
- **Solución:** cambiar a `bun install --frozen-lockfile`.
- **Motivo:** `--frozen-lockfile` falla el build si `package.json` divergió del lock — es el comportamiento correcto para CI.
- **Resultado esperado:** cualquier drift de dependencias rompe el build ANTES de deploy.

```diff
--- a/vercel.json
+++ b/vercel.json
@@
-  "installCommand": "npm install --legacy-peer-deps",
-  "buildCommand": "npm run build",
+  "installCommand": "bun install --frozen-lockfile",
+  "buildCommand": "bun run build",
   "framework": "vite",
```

---

## Checklist post-aplicación

- [ ] `bun run build` local pasa sin warnings de "external module".
- [ ] `vite-bundle-visualizer` confirma que `@sentry/browser` y `posthog-js` están **dentro** de chunks (no externals).
- [ ] Vercel deployment logs muestran `bun install --frozen-lockfile`.
- [ ] `wrangler.toml` no existe en el repo.
- [ ] Solo `bun.lock` persiste (no `bun.lockb`, no `package-lock.json`).
