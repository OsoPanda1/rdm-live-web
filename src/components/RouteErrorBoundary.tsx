import { Component, ErrorInfo, ReactNode } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'
import { logger } from "@/lib/logger"

interface Props {
  children: ReactNode
  route: string
}

interface State {
  hasError: boolean
  error?: Error
}

export class RouteErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error(`RouteErrorBoundary [${this.props.route}]:`, { error, errorInfo })
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
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
            <p className="text-sm text-muted-foreground mb-4">
              Error al cargar <strong>{this.props.route}</strong>.
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={this.handleRetry} className="btn-hero-primary inline-flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Reintentar
              </button>
              <button onClick={() => window.location.reload()} className="btn-hero-secondary inline-flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Recargar todo
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
