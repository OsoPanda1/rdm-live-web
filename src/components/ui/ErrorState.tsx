interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  variant?: 'inline' | 'fullscreen';
  className?: string;
}

export function ErrorState({
  title = 'Algo salió mal',
  message = 'No pudimos cargar esta sección. Intenta de nuevo.',
  onRetry,
  variant = 'inline',
  className = '',
}: ErrorStateProps) {
  const containerClass = variant === 'fullscreen'
    ? 'fixed inset-0 flex items-center justify-center bg-amber-50/80 z-50'
    : 'flex items-center justify-center';

  return (
    <div className={`${containerClass} ${className}`} role="alert">
      <div className="text-center max-w-md p-6">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
          <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-amber-900 mb-1">{title}</h3>
        <p className="text-sm text-amber-700/70 mb-4">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
          >
            Intentar de nuevo
          </button>
        )}
      </div>
    </div>
  );
}
