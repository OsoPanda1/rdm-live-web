// src/components/ErrorBoundary.tsx

import { Component, ErrorInfo, ReactNode } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { logger } from "@/lib/logger";

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log mínimo en consola, útil en dev
    logger.error('ErrorBoundary caught:', error, errorInfo)

    // Emite evento global para cualquier listener de telemetría/UI
    if (typeof window !== 'undefined') {
      try {
        window.dispatchEvent(
          new CustomEvent('rdm-error', {
            detail: {
              error,
              errorInfo,
              timestamp: new Date().toISOString(),
              boundary: 'ErrorBoundary',
            },
          }),
        )
      } catch (e) {
        // Si por alguna razón falla el CustomEvent, no rompemos más la app
        logger.error('ErrorBoundary event dispatch failed:', e)
      }
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            <div
              className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
              style={{
                background:
                  'linear-gradient(135deg, hsla(0,70%,50%,0.15), hsla(0,70%,50%,0.05))',
              }}
            >
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-foreground mb-2">
              Algo salió mal
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Ha ocurrido un error inesperado. Por favor, intenta recargar la página.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-hero-primary inline-flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Recargar página
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
