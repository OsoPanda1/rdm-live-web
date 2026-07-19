import { lazy, Suspense } from 'react'

const FullApp = lazy(() => import('./App'))

const AppShell = () => (
  <Suspense fallback={<div className="min-h-screen bg-background" />}>
    <FullApp />
  </Suspense>
)

export default AppShell
