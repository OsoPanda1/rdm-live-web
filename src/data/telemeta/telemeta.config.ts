// Configuración de telemetría (monitoreo) para RDM Digital
// Recopila métricas operativas, de error y de rendimiento del front-end.
// Se ejecuta en el lado del cliente utilizando Performance API, error reporting, canvas para huellas, y reporting.

export const TELEMETRIA_CONFIG = {
  // Métricas de rendimiento centradas en el usuario
  performance: {
    // Contentful Paint y Layout Shift específicos del Core Web Vitals
    // maxLargestContentfulPaint: umbral en ms para LCP (ideal < 2.5s)
    // maxCumulativeLayoutShift: umbral máximo aceptable para CLS (< 0.1)
    // maxFirstContentfulPaint: umbral en ms para FCP (ideal < 1.8s)
  },

  // Seguimiento de errores/reportando estabilidad en la UI
  errors: {
    // Captura errores no controlados del DOM, promesas rechazos
    // y fallos de red; normaliza antes de reportar.
  },

  // Métrica de actividad centrada en el usuario (engagement)
  engagement: {
    // Seguimiento de eventos interactivos del usuario:
    // clics del ratón, teclas presionadas, entradas en formularios
  },

  // Seguimiento de estado de conexión en el lado del cliente
  offline: {
    // Periodos sin conexión, reintentos de red, capacidad de recuperación de Service Worker
  },

  // Sesión de depuración en producción (agresivo en desarrollo, rudo en producción)
  debug: {
    // Solo activo en entorno de desarrollo para permitir captura detallada
    enabled: import.meta.env.DEV,
    // Intervalo de bloqueo de captura (ms) para aislar perfiles, evitar muchos off-tick
    captureIntervalMs: 1000,
  },
};

// Payload rígido de métricas de telemetría con tipos TypeScript estrictos
export type TelemObject = {
  // id_métrica (hash único, típico SHA‑256 o estructura bloque)
  id: string;
  // timestamp ISO `2024‑06‑27T...`
  ts: string;
  // nombre breve amigable para la UI
  nombre: string;
  // categoría para filtrar: `performance`, `error`, `engagement`, `offline`
  categoría: 'performance' | 'error' | 'engagement' | 'offline';
  // región del usuario cuando está disponible
  region: string;
  // datos ocultos para cada métrica
  data: unknown;
};

// Modelos de fábrica de métricas para mantener DRY
const build = <T extends object>(id: string, categoría: TelemObject['categoría'], data: T): TelemObject => (
  {
    id,
    ts: new Date().toISOString(),
    nombre: id,
    categoría,
    region: 'MX',
    data,
  } as const
);

// Helpers especializados para métricas habituales
export const telemetryExamples = {
  // Ejemplo de métrica de rendimiento (FPS)
  fps: () => build('fps', 'performance', { fps: typeof window !== 'undefined' ? Math.round((window.performance as any)?.now?.() ?? 60) : 60 }),

  // Ejemplo de error (falso, para pruebas)
  errorPage: () => build('error_page_view', 'error', { page: window.location.pathname, error: 'sin_conexion' }),

  // Ejemplo de actividad de usuario (click rápido)
  quickClick: () => build('link_click', 'engagement', { url: window.location.href, time: Date.now() }),

  // Métrica de memoria de visualización en el cliente para budgets de RAM
  memory: () => build('client_memory_mb', 'performance', {
    used: (typeof window !== 'undefined' && (window.performance as any)?.memory?.usedJSHeapSize) ?? 0 / 1048576,
    total: (typeof window !== 'undefined' && (window.performance as any)?.memory?.jsHeapSizeLimit) ?? 0 / 1048576,
  }),
};

// Registro de métricas a una función reportadora central (puede ser fuente de datos, beacon, o logger)

// === CARDINALITY & SAMPLING CONTROLS ===
// Máximo de entradas de telemetría únicas por sesión antes de aplicar muestreo
const MAX_ENTRIES_PER_SESSION = 10_000;
// Tasa de muestreo (0.0 - 1.0) al acercarse al límite de cardinalidad
const SAMPLING_RATE = 0.1;

let telemetryCounter = 0;

/**
 * Reporta una métrica de telemetría con guardas de cardinalidad y rate-limit.
 * Descarta eventos silenciosamente cuando se excede el límite por sesión
 * o cuando el muestreo reduce el volumen bajo backpressure.
 */
export const reportMetric = (metric: TelemObject): void => {
  telemetryCounter++;

  // Guarda de cardinalidad: descarte duro a las 10k por sesión
  if (telemetryCounter > MAX_ENTRIES_PER_SESSION) {
    if (telemetryCounter === MAX_ENTRIES_PER_SESSION + 1) {
      // console.warn would go here; cardinality guard active
    }
    return;
  }

  // Muestreo: solo reporta ~10% de eventos cuando está al 80% del límite
  if (telemetryCounter > MAX_ENTRIES_PER_SESSION * 0.8) {
    if (Math.random() > SAMPLING_RATE) return;
  }

  // Enviado a Supabase usando `telemeta` (productos de Supabase pga datos públicos)
  if (import.meta.env.VITE_SUPABASE_URL) {
    fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/telemeta`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY ?? '',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(metric),
    }).catch(() => {});
  }
};

/** Reinicia el contador de telemetría por sesión (llamar en navegación) */
export const resetTelemetryCounter = (): void => {
  telemetryCounter = 0;
};