import { Component, type ReactNode, type ErrorInfo } from "react";
import { MapPin, AlertTriangle } from "lucide-react";
import { logger } from "@/lib/logger";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class MapErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    logger.warn("[MapErrorBoundary] Error capturado: " + error.message);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex h-[420px] md:h-[640px] items-center justify-center rounded-2xl border border-white/10 bg-[hsl(var(--muted)/0.3)]">
            <div className="text-center p-6 max-w-md">
              <AlertTriangle className="h-10 w-10 text-[hsl(var(--rdm-amber))] mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-[hsl(var(--foreground))] mb-2">Mapa no disponible</h3>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                El componente cartográfico no pudo cargarse. Intenta recargar la página o vuelve más tarde.
              </p>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}