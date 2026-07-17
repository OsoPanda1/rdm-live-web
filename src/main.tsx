// src/main.tsx

import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { initSentry } from '@/integrations/observability/sentry'

// Fire-and-forget; init is a no-op until VITE_SENTRY_DSN is set.
void initSentry()

const container = document.getElementById('root')

if (!container) {
  // Error crítico temprano: si el DOM no tiene #root, no hay app que montar.
  throw new Error('No se encontró el elemento #root en el DOM.')
}

const root = createRoot(container)

const renderFatalFallback = (error?: unknown) => {
  const message = error instanceof Error ? error.message : 'Error de arranque desconocido'
  container.innerHTML = `
    <main style="min-height:100vh;display:grid;place-items:center;background:#0B0B0C;color:#E5E5E5;font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;padding:24px;">
      <section style="max-width:720px;border:1px solid rgba(229,229,229,.18);background:rgba(10,17,40,.82);padding:28px;border-radius:18px;box-shadow:0 24px 80px rgba(0,0,0,.35);">
        <p style="margin:0 0 8px;color:#D4B26A;font-size:12px;letter-spacing:.24em;text-transform:uppercase;">RDM Digital LTOS</p>
        <h1 style="margin:0 0 12px;font-size:clamp(28px,5vw,48px);line-height:1.02;">Plataforma en modo seguro</h1>
        <p style="margin:0;color:rgba(229,229,229,.78);line-height:1.6;">La interfaz principal no pudo iniciar correctamente. Recarga la página; si persiste, el registro técnico ya dejó una señal visible para evitar pantalla negra.</p>
        <pre style="white-space:pre-wrap;margin:18px 0 0;color:rgba(229,229,229,.58);font-size:12px;">${message.replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c] ?? c))}</pre>
      </section>
    </main>
  `
}

window.setTimeout(() => {
  if (!container.textContent?.trim()) {
    renderFatalFallback('El contenedor raíz quedó vacío después del arranque.')
  }
}, 4500)

try {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  )
} catch (error) {
  renderFatalFallback(error)
}
