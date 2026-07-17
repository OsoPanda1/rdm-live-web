interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'skeleton' | 'pulse';
  className?: string;
}

export function LoadingState({ message = 'Cargando...', size = 'md', variant = 'spinner', className = '' }: LoadingStateProps) {
  const sizeClasses = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };

  if (variant === 'skeleton') {
    return (
      <div className={`space-y-3 animate-pulse ${className}`} role="status" aria-label={message}>
        <div className="h-4 bg-amber-200/50 rounded w-3/4" />
        <div className="h-4 bg-amber-200/50 rounded w-1/2" />
        <div className="h-4 bg-amber-200/50 rounded w-5/6" />
        <span className="sr-only">{message}</span>
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={`flex items-center gap-3 ${className}`} role="status" aria-label={message}>
        <div className={`${sizeClasses[size]} rounded-full bg-amber-400/30 animate-ping`} />
        <span className="text-amber-800/60 text-sm">{message}</span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`} role="status" aria-label={message}>
      <div className={`${sizeClasses[size]} border-2 border-amber-600/30 border-t-amber-600 rounded-full animate-spin`} />
      <span className="text-amber-800/60 text-sm">{message}</span>
    </div>
  );
}
