export function LoadingFallback() {
  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-background text-foreground"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="rounded-2xl border border-border/60 bg-card/90 px-6 py-4 text-center shadow-lg">
        <div className="mx-auto mb-3 h-7 w-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm font-medium text-muted-foreground">Cargando experiencia territorial…</p>
      </div>
    </div>
  )
}
