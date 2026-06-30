// vite.config.ts

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { componentTagger } from 'lovable-tagger'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: true,
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === 'development' && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    dedupe: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
  },
  build: {
    // Umbral de advertencia aumentado (bundles legítimamente grandes)
    chunkSizeWarningLimit: 600,
    target: 'es2020',
    cssMinify: 'lightningcss',
    rollupOptions: {
      output: {
        // Vendor chunks: cada dependencia pesada en su propio chunk
        manualChunks(id) {
          // React core
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react'
          }
          // React Router
          if (id.includes('node_modules/react-router')) {
            return 'vendor-router'
          }
          // Three.js + React Three Fiber
          if (
            id.includes('node_modules/three') ||
            id.includes('node_modules/@react-three')
          ) {
            return 'vendor-three'
          }
          // Leaflet + React Leaflet
          if (
            id.includes('node_modules/leaflet') ||
            id.includes('node_modules/react-leaflet') ||
            id.includes('node_modules/supercluster')
          ) {
            return 'vendor-map'
          }
          // Recharts + d3
          if (
            id.includes('node_modules/recharts') ||
            id.includes('node_modules/d3') ||
            id.includes('node_modules/victory')
          ) {
            return 'vendor-charts'
          }
          // Framer Motion
          if (id.includes('node_modules/framer-motion')) {
            return 'vendor-motion'
          }
          // React Markdown + remark
          if (
            id.includes('node_modules/react-markdown') ||
            id.includes('node_modules/remark') ||
            id.includes('node_modules/unified') ||
            id.includes('node_modules/micromark') ||
            id.includes('node_modules/mdast')
          ) {
            return 'vendor-markdown'
          }
          // TanStack Query
          if (id.includes('node_modules/@tanstack')) {
            return 'vendor-query'
          }
          // Radix UI primitives
          if (id.includes('node_modules/@radix-ui')) {
            return 'vendor-radix'
          }
          // Supabase
          if (id.includes('node_modules/@supabase')) {
            return 'vendor-supabase'
          }
          // Date utils
          if (id.includes('node_modules/date-fns')) {
            return 'vendor-dates'
          }
          // Resto de node_modules → vendor-misc
          if (id.includes('node_modules')) {
            return 'vendor-misc'
          }
        },
      },
    },
  },
}))
