# Parche 06 — Rendimiento Vercel: RES 84 → 95+ (Fase 5, riesgo medio)

Análisis y plan de optimización basado en datos reales de **Vercel Speed Insights** para llevar el Real Experience Score de **84 → 95+**.

---

## 1. Diagnóstico Actual (Vercel Speed Insights)

| Métrica | Valor Actual | Score | Peso | Target | Score Target |
|---------|-------------|-------|------|--------|-------------|
| FCP | 2.136s | 84 | 15% | < 1.6s | 92 |
| LCP | **3.48s** | **67** | **30%** | **< 2.0s** | **92** |
| INP | 296ms | 85 | 30% | < 180ms | 92 |
| CLS | 0.0224 | 100 | 25% | — | 100 |

**RES Actual:** 84 (12.6 + 20.1 + 25.5 + 25.0)
**RES Target:** 95 (13.8 + 27.6 + 27.6 + 25.0)

**Mayor oportunidad:** LCP (3.48s → 2.0s = +7.5 pts) e INP (296ms → 180ms = +2.1 pts).

---

## 2. Cuello de Botella #1: App.tsx — 14 providers + overlays eager

### Problema
```tsx
// App.tsx — TODOS estos imports son EAGER (se evalúan al parsear el módulo)
import { CinematicIntro } from '@/components/CinematicIntro'  // → 45KB + audio MP3
import AmbientLayer from '@/components/AmbientLayer'            // → 8KB
import LiveTelemetryBadge from '@/components/LiveTelemetryBadge' // → 12KB + fetch /api/telemetry
import SearchOverlay from '@/components/SearchOverlay'          // → 15KB
import SmartSidebar from '@/components/SmartSidebar'            // → 20KB
import GlobalPlayerBar from '@/components/GlobalPlayerBar'      // → 10KB + audio context
import RealitoChatLauncher from './components/RealitoChatLauncher' // → 8KB
import { SpeedInsights } from '@vercel/speed-insights/react'    // → 5KB gz
import { Analytics } from '@vercel/analytics/react'             // → 3KB gz
```

**Impacto:** ~126KB de JS + recursos adicionales bloquean el primer pintado. La app entera se renderiza dentro de `CinematicIntro` que muestra una animación de 5s antes de revelar contenido.

### Solución
```diff
--- a/src/App.tsx
+++ b/src/App.tsx
@@ -12,19 +12,22 @@
-import { CinematicIntro } from '@/components/CinematicIntro'
-import MicroPageIntro from '@/components/MicroPageIntro'
-import RealitoChatLauncher from './components/RealitoChatLauncher'
-import AmbientLayer from '@/components/AmbientLayer'
-import LiveTelemetryBadge from '@/components/LiveTelemetryBadge'
-import SearchOverlay from '@/components/SearchOverlay'
-import SmartSidebar from '@/components/SmartSidebar'
-import GlobalPlayerBar from '@/components/GlobalPlayerBar'
+const CinematicIntro = lazy(() => import('@/components/CinematicIntro'))
+const MicroPageIntro = lazy(() => import('@/components/MicroPageIntro'))
+const RealitoChatLauncher = lazy(() => import('./components/RealitoChatLauncher'))
+const AmbientLayer = lazy(() => import('@/components/AmbientLayer'))
+const LiveTelemetryBadge = lazy(() => import('@/components/LiveTelemetryBadge'))
+const SearchOverlay = lazy(() => import('@/components/SearchOverlay'))
+const SmartSidebar = lazy(() => import('@/components/SmartSidebar'))
+const GlobalPlayerBar = lazy(() => import('@/components/GlobalPlayerBar'))
```

Esto reduce el bundle inicial en **~126KB gz** (~40% del JS inicial). Los componentes se cargan solo cuando entran en el árbol de render.

---

## 3. Cuello de Botella #2: CinematicIntro bloquea todo el contenido

### Problema
```tsx
{showIntro && !introComplete && (
  <CinematicIntro onEnter={handleIntroComplete} />
)}
```
Mientras `showIntro === true` e `introComplete === false`, el 100% del contenido del sitio está oculto detrás de la intro. El usuario ve una pantalla negra + animación de audio durante 5-8s.

Esto **destroza** LCP (el hero no se pinta hasta después de la intro) y FCP.

### Solución: Solo en landing page, no en navegación interna
```diff
 const [showIntro] = useState(() => {
   const isBrowser = typeof window !== 'undefined'
   if (!isBrowser) return false
+  // Solo mostrar intro en la landing page principal
+  if (window.location.pathname !== '/') return false
   if (sessionStorage.getItem('rdm_intro_shown')) return false
   sessionStorage.setItem('rdm_intro_shown', 'true')
   return true
 })
```

**Impacto:** Elimina 5-8s de bloqueo en todas las rutas excepto `/`. Las páginas internas renderizan contenido inmediato.

---

## 4. Cuello de Botella #3: font-display: fallback → FOIT

### index.html — problema
Google Fonts se carga con `media="print" onload="this.media='all'"` que evita render-blocking, pero el navegador no renderiza texto hasta que la fuente descarga — causa **FOIT** (Flash of Invisible Text) que infla FCP/LCP.

### Solución
Agregar `font-display: swap` en la URL de Google Fonts (ya está incluido) pero además precargar el CSS de fonts con fetch priority.

```diff
-<link rel="preload" href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700;800&display=swap" as="style" crossorigin />
-<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700;800&display=swap" media="print" onload="this.media='all'" crossorigin />
+<link rel="preload" href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Playfair+Display:wght@700;800&display=swap" as="style" fetchpriority="high" crossorigin />
+<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Playfair+Display:wght@700;800&display=swap" media="print" onload="this.media='all'; this.onload=null" crossorigin />
+<noscript><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Playfair+Display:wght@700;800&display=swap" crossorigin /></noscript>
```

Reducir pesos de 7 → 5 (eliminar los de menor uso: 300, 600) para reducir tamaño de descarga.

---

## 5. Cuello de Botella #4: Bundle — vendor chunks sin modulepreload

### Problema
Aunque Vite ya separa vendor chunks, el navegador los descarga en serie (cada import() resuelve un módulo → fetch → eval). No hay `<link rel="modulepreload">` para los chunks críticos.

### Solución
En `index.html`, agregar modulepreload para los 3 chunks más importantes + preconnect para Supabase.

```html
<!-- Priority hints para los chunks críticos del shell -->
<link rel="modulepreload" href="/assets/vendor-react-xxx.js" />
<link rel="modulepreload" href="/assets/vendor-router-xxx.js" />
<link rel="modulepreload" href="/assets/vendor-motion-xxx.js" />
<link rel="modulepreload" href="/assets/vendor-radix-xxx.js" />
```

> **Nota:** Los hashes cambian en cada build. Mejor usar el plugin `vite-plugin-preload` o generar dinámicamente los modulepreload desde `manifest.json` en HTML.

---

## 6. Cuello de Botella #5: Imágenes sin optimizar

### Problema
Las imágenes en `src/assets/` son JPEG/PNG sin WebP. Las imágenes de héroe no tienen `srcset` ni `fetchpriority="high"`. Esto alarga LCP porque el navegador no prioriza la imagen del hero.

### Solución en componentes que renderizan LCP candidates

```diff
-<img src={heroImg} alt="Real del Monte" />
+<img
+  src={heroImg}
+  alt="Real del Monte"
+  fetchpriority="high"
+  loading="eager"
+  decoding="async"
+  width="1920"
+  height="1080"
+/>
```

Y convertir assets a WebP con:
```bash
# Usar squoosh CLI o sharp
npx sharp src/assets/hero-real-del-monte.webp -o public/images/hero.webp
```

---

## 7. Cuello de Botella #6: PostHog/Sentry/SpeedInsights bloquean main thread

### Problema
`PostHogProvider` se monta eager en el árbol React. Aunque su init es condicional (no hace nada sin key), `@vercel/speed-insights` y `@vercel/analytics` siempre se montan y ejecutan.

### Solución: requestIdleCallback

```diff
-<PostHogProvider>
-  <RDMAuthProvider>
+<RDMAuthProvider>
```

Y mover PostHog/SpeedInsights/Analytics dentro de un deferred wrapper:

```tsx
// App.tsx
const AnalyticsDeferred = () => {
  useEffect(() => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        import('@/integrations/observability/posthog')
        import('@vercel/speed-insights/react')
        import('@vercel/analytics/react')
      }, { timeout: 3000 })
    }
  }, [])
  return null
}
```

**Impacto:** Libera el main thread ~300ms antes en la carga inicial.

---

## 8. Cuello de Botella #7: No hay lazy() en módulos pesados dentro de páginas

### Problema
Páginas como `Mapa.tsx` importan Leaflet top-level, `AtlasMaximus.tsx` importa Three.js top-level, etc. Aunque los vendor chunks están separados, siguen siendo imports estáticos que el bundler no puede tree-shake.

### Solución
```diff
-import { MapContainer, TileLayer } from 'react-leaflet'
+const MapContainer = lazy(() => import('react-leaflet').then(m => ({ default: m.MapContainer })))
+const TileLayer = lazy(() => import('react-leaflet').then(m => ({ default: m.TileLayer })))
```

**Impacto:** Leaflet (250KB) y Three.js (600KB) solo se descargan cuando el usuario navega a una página que los necesita.

---

## 9. Resumen de Impacto Estimado

| Acción | Impacto LCP | Impacto FCP | Impacto INP | Esfuerzo |
|--------|------------|------------|------------|----------|
| lazy() overlays + providers | -0.4s | -0.3s | -20ms | Bajo |
| CinematicIntro solo en `/` | **-1.5s** | -0.5s | — | Bajo |
| modulepreload chunks críticos | -0.3s | -0.2s | — | Medio |
| font-display + pesos reducidos | — | -0.2s | — | Bajo |
| fetchpriority high en hero | **-0.5s** | -0.1s | — | Bajo |
| lazy() Leaflet/Three en páginas | -0.8s* | -0.3s | -50ms | Medio |
| requestIdleCallback analytics | — | — | -80ms | Bajo |
| Imágenes WebP + srcset | -0.4s | -0.2s | — | Alto |

**Estimado:** LCP 3.48s → ~1.8-2.0s, FCP 2.136s → ~1.2-1.5s, INP 296ms → ~180ms. **RES projectado: ~94-96**.

---

## 10. Checklist de Implementación (orden sugerido)

### Sprint 1 — Alto impacto, bajo esfuerzo (esta sesión)
- [ ] lazy() todos los overlays en App.tsx (AmbientLayer, LiveTelemetryBadge, SearchOverlay, SmartSidebar, GlobalPlayerBar, RealitoChatLauncher)
- [ ] CinematicIntro solo en landing page `/`
- [ ] fetchpriority="high" + loading="eager" en hero image de Index.tsx
- [ ] Reducir pesos de Google Fonts (eliminar 300, 600)

### Sprint 2 — Impacto medio (próxima iteración)
- [ ] Mover PostHog/SpeedInsights/Analytics a requestIdleCallback
- [ ] modulepreload para chunks críticos en index.html (requiere leer manifest.json o usar plugin)
- [ ] lazy() Leaflet en pages/Mapa.tsx

### Sprint 3 — Optimización de assets
- [ ] Convertir imágenes a WebP (npx sharp)
- [ ] Agregar srcset en componentes ImageGallery y hero
- [ ] Auditar con vite-bundle-visualizer

---

## 11. Verificación

```bash
# 1. Build con reporte de bundle
npx vite-bundle-visualizer

# 2. Verificar tamaños de chunk
ls -la dist/assets/ | sort -k5 -rn | head -20

# 3. Probar local con Lighthouse
npx lighthouse http://localhost:8080 --view

# 4. Verificar en Vercel Speed Insights tras deploy
# RES debe subir de 84 a 95+ en 24-48h de datos reales
```
