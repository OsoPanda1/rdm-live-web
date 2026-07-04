// src/main.tsx

import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

const container = document.getElementById('root')

if (!container) {
  // Error crítico temprano: si el DOM no tiene #root, no hay app que montar.
  throw new Error('No se encontró el elemento #root en el DOM.')
}

const root = createRoot(container)

const BootstrapFallback = ({
  error,
}: {
  error?: unknown
}) => (
  <div className="min-h-screen w-full flex items-center justify-center bg-background p-6 text-foreground">
    <div className="max-w-lg rounded-2xl border border-destructive/30 bg-card p-6 text-center shadow-xl">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-destructive">
        Error de arranque
      </p>
      <h1 className="mt-3 font-serif text-2xl font-bold">
        No pudimos cargar la aplicación
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        El paquete principal no se inicializó correctamente. Recarga la página para intentar de
        nuevo.
      </p>
      {error instanceof Error && (
        <pre className="mt-4 max-h-40 overflow-auto rounded-lg bg-muted p-3 text-left text-xs text-muted-foreground">
          {error.message}
        </pre>
      )}
      <button
        onClick={() => window.location.reload()}
        className="btn-hero-primary mt-6 inline-flex items-center justify-center"
      >
        Recargar aplicación
      </button>
    </div>
  </div>
)

async function bootstrap() {
  try {
    const [{ default: App }, { initSentry }] = await Promise.all([
      import('./App'),
      import('@/integrations/observability/sentry'),
    ])

    // Fire-and-forget; init is a no-op until VITE_SENTRY_DSN is set.
    void initSentry()

    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>,
    )
  } catch (error) {
    console.error('[bootstrap] Failed to initialize application:', error)
    root.render(
      <React.StrictMode>
        <BootstrapFallback error={error} />
      </React.StrictMode>,
    )
  }
}

void bootstrap()
