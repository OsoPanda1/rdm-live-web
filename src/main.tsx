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

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
