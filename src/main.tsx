// src/main.tsx

import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import AppShell from './AppShell'

const container = document.getElementById('root')

if (!container) {
  throw new Error('No se encontró el elemento #root en el DOM.')
}

const root = createRoot(container)

root.render(
  <React.StrictMode>
    <AppShell />
  </React.StrictMode>,
)
