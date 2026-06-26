/**
 * apps/admin — Surface administrativa.
 * Consume `@analytics` para dashboards y `@core-kernel` para readiness.
 *
 * Este módulo expone las entradas lazy‑loaded de la surface administrativa
 * y del dashboard principal, con tipado explícito para mejorar DX y evitar
 * errores silenciosos en los imports dinámicos.
 */

import { lazy, type ComponentType } from "react"
// Si ya tienes un logger/analytics central, conéctalo aquí.
import { logger } from "@/services/logger"
import { trackPerfMetric } from "@/services/analytics" // opcional

/**
 * Orquestador e Instrumentador Asíncrono de Chunks.
 * Envuelve la promesa de carga para inyectar telemetría de rendimiento y
 * aislamiento de fallos, sin alterar la firma ni añadir fricción al developer.
 */
const instrumentLoader = <T extends ComponentType<any>>(
  loader: () => Promise<{ default: T }>,
): (() => Promise<{ default: T }>) => {
  // Resolvemos el identificador de chunk una sola vez para evitar
  // parsear el .toString() en cada carga.
  const loaderString = loader.toString()
  const pathMatch = loaderString.match(
    /import\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/,
  )
  const chunkIdentifier = pathMatch?.[1] ?? "dynamic-chunk"

  return async () => {
    const markStart = `chunk-load-start:${chunkIdentifier}`
    const markEnd = `chunk-load-end:${chunkIdentifier}`

    const hasPerformance =
      typeof window !== "undefined" && "performance" in window

    if (hasPerformance) {
      performance.mark(markStart)
    }

    try {
      const module = await loader()

      if (hasPerformance) {
        performance.mark(markEnd)
        performance.measure(
          `📦 [UI KERNEL] Load Time: ${chunkIdentifier}`,
          markStart,
          markEnd,
        )

        const [measure] = performance.getEntriesByName(
          `📦 [UI KERNEL] Load Time: ${chunkIdentifier}`,
        )
        if (measure) {
          // Envía a tu sistema de analítica si existe
          trackPerfMetric?.("chunk_load_time", {
            chunk: chunkIdentifier,
            durationMs: measure.duration,
          })
        }
      }

      return module
    } catch (error) {
      // Manejo y visibilidad de fallos críticos de red
      logger.error(
        "[UI KERNEL] Error al descargar chunk",
        {
          chunk: chunkIdentifier,
          error,
        },
      )
      // Podrías disparar aquí un evento para Sentry/Datadog si existe
      // reportChunkLoadError?.(chunkIdentifier, error)

      throw error
    } finally {
      // Limpieza opcional de marcas para no contaminar el buffer de performance
      if (hasPerformance) {
        performance.clearMarks(markStart)
        performance.clearMarks(markEnd)
      }
    }
  }
}

/**
 * Lazy factory tipada para componentes React.
 * Evita repetir la anotación de tipo y facilita la refactorización.
 */
function lazyComponent<T extends ComponentType<any>>(
  loader: () => Promise<{ default: T }>,
): T {
  // React.lazy maneja la promesa instrumentada y devuelve el componente
  // con el tipo original.
  return lazy(instrumentLoader(loader)) as unknown as T
}

/**
 * AdminDashboard — Surface administrativa principal.
 *
 * - Debe exportar un default component desde "@/pages/admin/Dashboard".
 * - Pensada para usarse dentro de una <Suspense> con fallback adecuado.
 */
export const AdminDashboard = lazyComponent(
  () => import("@/pages/admin/Dashboard"),
)

/**
 * Dashboard — Surface general de usuario.
 *
 * - Debe exportar un default component desde "@/pages/Dashboard".
 * - Ideal para integrar con un router (React Router / TanStack Router)
 *   usando route‑level code splitting.
 */
export const Dashboard = lazyComponent(
  () => import("@/pages/Dashboard"),
)
