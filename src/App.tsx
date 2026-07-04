// src/App.tsx

import { useState, useCallback, useEffect, lazy, Suspense, Component, type ErrorInfo, type ReactNode } from 'react'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AnimatePresence } from 'framer-motion'
import ErrorBoundary from '@/components/ErrorBoundary'
import { RouteErrorBoundary } from '@/components/RouteErrorBoundary'
import { AudioPlayerProvider } from '@/contexts/AudioPlayerContext'
import { RDMAuthProvider, useRDMAuth } from '@/contexts/RDMAuthContext'
import { NotificationProvider } from '@/components/NotificationSystem'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { Analytics } from '@vercel/analytics/react'
import { logger } from '@/lib/logger'

// Componentes pesados: lazy loading para reducir bundle inicial (~126KB)
const CinematicIntro = lazy(() => import('@/components/CinematicIntro').then((m) => ({ default: m.CinematicIntro })))
const MicroPageIntro = lazy(() => import('@/components/MicroPageIntro'))
const RealitoChatLauncher = lazy(() => import('./components/RealitoChatLauncher'))
const AmbientLayer = lazy(() => import('@/components/AmbientLayer'))
const LiveTelemetryBadge = lazy(() => import('@/components/LiveTelemetryBadge'))
const SearchOverlay = lazy(() => import('@/components/SearchOverlay'))
const SmartSidebar = lazy(() => import('@/components/SmartSidebar'))
const GlobalPlayerBar = lazy(() => import('@/components/GlobalPlayerBar'))

// ===== Mother repo pages =====
const Index = lazy(() => import('./pages/Index'))
const Lugares = lazy(() => import('./pages/Lugares'))
const Directorio = lazy(() => import('./pages/Directorio'))
const Eventos = lazy(() => import('./pages/Eventos'))
const Comunidad = lazy(() => import('./pages/Comunidad'))
const Mapa = lazy(() => import('./pages/Mapa'))
const Historia = lazy(() => import('./pages/Historia'))
const Cultura = lazy(() => import('./pages/Cultura'))
const Relatos = lazy(() => import('./pages/Relatos'))
const Ecoturismo = lazy(() => import('./pages/Ecoturismo'))
const Gastronomia = lazy(() => import('./pages/Gastronomia'))
const Arte = lazy(() => import('./pages/Arte'))
const Rutas = lazy(() => import('./pages/Rutas'))
const NotFound = lazy(() => import('./pages/NotFound'))
const Auth = lazy(() => import('./pages/Auth'))
const Apoya = lazy(() => import('./pages/Apoya'))
const Reglamento = lazy(() => import('./pages/Reglamento'))
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'))
const AdminMusica = lazy(() => import('./pages/admin/Musica'))
const Musica = lazy(() => import('./pages/Musica'))
const Dichos = lazy(() => import('./pages/Dichos'))
const Catalogo = lazy(() => import('./pages/Catalogo'))
const NegociosPortal = lazy(() => import('./pages/NegociosPortal'))

// ===== Smart City OS pages =====
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Comercios = lazy(() => import('./pages/Comercios'))
const Paquetes = lazy(() => import('./pages/Paquetes'))
const ComunidadPage = lazy(() => import('./pages/ComunidadPage'))
const TransporteLocal = lazy(() => import('./pages/TransporteLocal'))
const ShuttleCDMX = lazy(() => import('./pages/ShuttleCDMX'))

// ===== RDM Digital-X pages =====
const QuienesSomos = lazy(() => import('./pages/QuienesSomos'))
const Donar = lazy(() => import('./pages/Donar'))
const GraciasDonativo = lazy(() => import('./pages/GraciasDonativo'))
const ComerciosPanel = lazy(() => import('./pages/ComerciosPanel'))

// ===== Elevated pages =====
const MapaVivo = lazy(() => import('./pages/MapaVivo'))
const RegistroComercio = lazy(() => import('./pages/RegistroComercio'))

// ===== Citemesh / Wiki pages =====
const Introduccion = lazy(() => import('./pages/Introduccion'))
const Filosofia = lazy(() => import('./pages/Filosofia'))
const Arquitectura = lazy(() => import('./pages/Arquitectura'))
const DomainPage = lazy(() => import('./pages/DomainPage'))
const IAAgentes = lazy(() => import('./pages/IAAgentes'))
const Timeline = lazy(() => import('./pages/Timeline'))
const Documentacion = lazy(() => import('./pages/Documentacion'))
const Gobernanza = lazy(() => import('./pages/Gobernanza'))
const SistemasAvanzados = lazy(() => import('./pages/SistemasAvanzados'))
const Manuales = lazy(() => import('./pages/Manuales'))
const Despliegue = lazy(() => import('./pages/Despliegue'))
const BiografiaCEO = lazy(() => import('./pages/BiografiaCEO'))
const CasosDeUso = lazy(() => import('./pages/CasosDeUso'))
const KitAPIs = lazy(() => import('./pages/KitAPIs'))
const Estrategia = lazy(() => import('./pages/Estrategia'))
const WikiTAMV = lazy(() => import('./pages/WikiTAMV'))
const RedSocial = lazy(() => import('./pages/RedSocial'))
const SeguridadTenochtitlan = lazy(() => import('./pages/SeguridadTenochtitlan'))
const BlockchainMSR = lazy(() => import('./pages/BlockchainMSR'))
const XRTecnologia = lazy(() => import('./pages/XRTecnologia'))
const EconomiaFederada = lazy(() => import('./pages/EconomiaFederada'))
const QuantumComputing = lazy(() => import('./pages/QuantumComputing'))
const EnciclopediaUniversal = lazy(() => import('./pages/EnciclopediaUniversal'))
const IsabellaAI = lazy(() => import('./pages/IsabellaAI'))
const ImpactoCivilizatorio = lazy(() => import('./pages/ImpactoCivilizatorio'))

// ===== Genesis / TAMV pages =====
const Documentation = lazy(() => import('./pages/Documentation'))
const Membership = lazy(() => import('./pages/Membership'))
const AuthCallback = lazy(() => import('./pages/AuthCallback'))
const MetaverseHome = lazy(() => import('./pages/MetaverseHome'))
const Register = lazy(() => import('./pages/Register'))
const Login = lazy(() => import('./pages/Login'))

// ===== Civilizational Core pages =====
const Guardian = lazy(() => import('./pages/Guardian'))
const Atlas = lazy(() => import('./pages/Atlas'))
const DevHub = lazy(() => import('./pages/DevHub'))
const Feed = lazy(() => import('./pages/Feed'))

// ===== New Tourism pages =====
const Estacionamientos = lazy(() => import('./pages/Estacionamientos'))
const PatrimonioCultural = lazy(() => import('./pages/PatrimonioCultural'))

// ===== Atlas territorial chapters =====
const AtlasCapitulos = lazy(() => import('./pages/AtlasCapitulos'))
const AtlasMinas = lazy(() => import('./pages/AtlasMinas'))
const AtlasPastes = lazy(() => import('./pages/AtlasPastes'))
const AtlasCementerio = lazy(() => import('./pages/AtlasCementerio'))
const AtlasCalles = lazy(() => import('./pages/AtlasCalles'))
const AtlasLeyendas = lazy(() => import('./pages/AtlasLeyendas'))
const AtlasMaximus = lazy(() => import('./pages/AtlasMaximus'))
const EcosistemaLTOS = lazy(() => import('./pages/EcosistemaLTOS'))
const Perfil = lazy(() => import('./pages/Perfil'))
const Leaderboard = lazy(() => import('./pages/Leaderboard'))
const TerritorialDashboard = lazy(() => import('./pages/TerritorialDashboard'))

// ===== Absorbed from rdm-digital-soul / real-del-monte-digital =====
const Wiki = lazy(() => import('./pages/Wiki'))
const ControlCenter = lazy(() => import('./pages/ControlCenter'))
const B2BPortal = lazy(() => import('./pages/B2BPortal'))
const GamePortal = lazy(() => import('./pages/GamePortal'))
const Juegos = lazy(() => import('./pages/Juegos'))
const LTOS = lazy(() => import('./pages/LTOS'))
const Mitos = lazy(() => import('./pages/Mitos'))
const MusicDetail = lazy(() => import('./pages/MusicDetail'))
const Recorridos = lazy(() => import('./pages/Recorridos'))
const RegistrarComercioPage = lazy(() => import('./pages/RegistrarComercio'))
const RutaDelPaste = lazy(() => import('./pages/RutaDelPaste'))
const AdminPanel = lazy(() => import('./pages/Admin'))
const DemoChecklist = lazy(() => import('./pages/DemoChecklist'))
const RealitoAIPage = lazy(() => import('./pages/RealitoAI'))

// ===== Absorbed from RDM-LIVOS-MEXICO =====
const ArchivoSonoro = lazy(() => import('./pages/ArchivoSonoro'))
const ComerciosCheckout = lazy(() => import('./pages/ComerciosCheckout'))
const ComerciosRegistroPage = lazy(() => import('./pages/ComerciosRegistro'))
const Evolucion = lazy(() => import('./pages/Evolucion'))
const FAQ = lazy(() => import('./pages/FAQ'))
const FusionEcosystem = lazy(() => import('./pages/FusionEcosystem'))
const Membresias = lazy(() => import('./pages/Membresias'))
const PremiumPlans = lazy(() => import('./pages/PremiumPlans'))
const Mina = lazy(() => import('./pages/Mina'))
const Operativo = lazy(() => import('./pages/Operativo'))
const TAMVApiExplorer = lazy(() => import('./pages/TAMVApiExplorer'))
const TAMVHub = lazy(() => import('./pages/TAMVHub'))
const TAMVStatus = lazy(() => import('./pages/TAMVStatus'))
const TAMVThesis = lazy(() => import('./pages/TAMVThesis'))
const RFCList = lazy(() => import('./pages/RFCList'))
const RFCDetail = lazy(() => import('./pages/RFCDetail'))
const TelemetryDashboard = lazy(() => import('./pages/TelemetryDashboard'))
const Tenochtitlan = lazy(() => import('./pages/Tenochtitlan'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 5 minutos: suficiente para datos de turismo/directorio que no cambian cada segundo
      staleTime: 5 * 60 * 1000,
      // Mantener en caché 30 minutos tras quedar sin suscriptores
      gcTime: 30 * 60 * 1000,
      retry: 1,
      retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 30_000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      // Evitar refetch en mount si los datos aún son frescos
      refetchOnMount: true,
    },
    mutations: {
      retry: 0,
    },
  },
})


// Fallback visible y accesible para loads de rutas
const RouteFallback = () => (
  <div
    className="min-h-screen w-full flex items-center justify-center bg-background"
    aria-label="Cargando contenido"
  >
    <div className="animate-pulse text-muted-foreground">
      Cargando experiencia territorial…
    </div>
  </div>
)

// Banner global de estado de auth / Supabase
const AuthStatusBanner = () => {
  const { isSupabaseReady, error } = useRDMAuth()

  if (isSupabaseReady && !error) return null

  return (
    <div className="w-full bg-amber-900 text-amber-100 text-xs sm:text-sm px-4 py-2 z-50 shadow-md">
      {!isSupabaseReady && (
        <p>
          Autenticación temporalmente deshabilitada: Supabase no está disponible en este
          entorno. Puedes seguir explorando mapas, rutas, economía y narrativas sin iniciar
          sesión.
        </p>
      )}
      {error && (
        <p className="mt-1">
          Detalle técnico: <span className="font-mono break-all">{error}</span>
        </p>
      )}
    </div>
  )
}

const AppCrashFallback = () => (
  <div className="min-h-screen w-full flex items-center justify-center bg-background p-6">
    <div className="max-w-lg rounded-2xl border border-destructive/30 bg-card p-6 text-center shadow-xl">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-destructive">
        Error crítico
      </p>
      <h1 className="mt-3 font-serif text-2xl font-bold text-foreground">
        No pudimos iniciar la experiencia
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Se detectó un fallo durante el arranque de la aplicación. Recarga la página o
        vuelve a intentar en unos segundos.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="btn-hero-primary mt-6 inline-flex items-center justify-center"
      >
        Recargar aplicación
      </button>
    </div>
  </div>
)

class AppCrashBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('AppCrashBoundary caught a bootstrap error:', { error, errorInfo })

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('rdm-error', {
          detail: {
            error,
            errorInfo,
            timestamp: new Date().toISOString(),
            boundary: 'AppCrashBoundary',
          },
        }),
      )
    }
  }

  render() {
    if (this.state.hasError) return <AppCrashFallback />
    return this.props.children
  }
}

const AnimatedRoutes = () => {
  const location = useLocation()

  return (
    <AnimatePresence mode="popLayout">
      <Suspense fallback={<RouteFallback />}>
        <Routes location={location}>
          <Route path="/" element={<RouteErrorBoundary route="/"><Index /></RouteErrorBoundary>} />
          <Route path="/mapa" element={<RouteErrorBoundary route="/mapa"><Mapa /></RouteErrorBoundary>} />
          <Route path="/lugares" element={<RouteErrorBoundary route="/lugares"><Lugares /></RouteErrorBoundary>} />
          <Route path="/directorio" element={<RouteErrorBoundary route="/directorio"><Directorio /></RouteErrorBoundary>} />
          <Route path="/eventos" element={<RouteErrorBoundary route="/eventos"><Eventos /></RouteErrorBoundary>} />
          <Route path="/comunidad" element={<RouteErrorBoundary route="/comunidad"><Comunidad /></RouteErrorBoundary>} />
          <Route path="/historia" element={<RouteErrorBoundary route="/historia"><Historia /></RouteErrorBoundary>} />
          <Route path="/cultura" element={<RouteErrorBoundary route="/cultura"><Cultura /></RouteErrorBoundary>} />
          <Route path="/relatos" element={<RouteErrorBoundary route="/relatos"><Relatos /></RouteErrorBoundary>} />
          <Route path="/ecoturismo" element={<RouteErrorBoundary route="/ecoturismo"><Ecoturismo /></RouteErrorBoundary>} />
          <Route path="/gastronomia" element={<RouteErrorBoundary route="/gastronomia"><Gastronomia /></RouteErrorBoundary>} />
          <Route path="/arte" element={<RouteErrorBoundary route="/arte"><Arte /></RouteErrorBoundary>} />
          <Route path="/rutas" element={<RouteErrorBoundary route="/rutas"><Rutas /></RouteErrorBoundary>} />
          <Route path="/auth" element={<RouteErrorBoundary route="/auth"><Auth /></RouteErrorBoundary>} />
          <Route path="/auth/callback" element={<RouteErrorBoundary route="/auth/callback"><AuthCallback /></RouteErrorBoundary>} />
          <Route path="/apoya" element={<RouteErrorBoundary route="/apoya"><Apoya /></RouteErrorBoundary>} />
          <Route path="/reglamento" element={<RouteErrorBoundary route="/reglamento"><Reglamento /></RouteErrorBoundary>} />
          <Route path="/admin" element={<RouteErrorBoundary route="/admin"><AdminDashboard /></RouteErrorBoundary>} />
          <Route path="/admin/musica" element={<RouteErrorBoundary route="/admin/musica"><AdminMusica /></RouteErrorBoundary>} />
          <Route path="/musica" element={<RouteErrorBoundary route="/musica"><Musica /></RouteErrorBoundary>} />
          <Route path="/dichos" element={<RouteErrorBoundary route="/dichos"><Dichos /></RouteErrorBoundary>} />
          <Route path="/dichos-mineros" element={<RouteErrorBoundary route="/dichos-mineros"><Dichos /></RouteErrorBoundary>} />
          <Route path="/catalogo" element={<RouteErrorBoundary route="/catalogo"><Catalogo /></RouteErrorBoundary>} />
          <Route path="/negocios" element={<RouteErrorBoundary route="/negocios"><NegociosPortal /></RouteErrorBoundary>} />
          <Route path="/dashboard" element={<RouteErrorBoundary route="/dashboard"><Dashboard /></RouteErrorBoundary>} />
          <Route path="/comercios" element={<RouteErrorBoundary route="/comercios"><Comercios /></RouteErrorBoundary>} />
          <Route path="/paquetes" element={<RouteErrorBoundary route="/paquetes"><Paquetes /></RouteErrorBoundary>} />
          <Route path="/comunidad-social" element={<RouteErrorBoundary route="/comunidad-social"><ComunidadPage /></RouteErrorBoundary>} />
          <Route path="/transporte-local" element={<RouteErrorBoundary route="/transporte-local"><TransporteLocal /></RouteErrorBoundary>} />
          <Route path="/shuttle-cdmx-rdm" element={<RouteErrorBoundary route="/shuttle-cdmx-rdm"><ShuttleCDMX /></RouteErrorBoundary>} />
          <Route path="/explorar" element={<RouteErrorBoundary route="/explorar"><Mapa /></RouteErrorBoundary>} />
          <Route path="/experiencias" element={<RouteErrorBoundary route="/experiencias"><Rutas /></RouteErrorBoundary>} />
          <Route path="/patrimonio" element={<RouteErrorBoundary route="/patrimonio"><Cultura /></RouteErrorBoundary>} />
          <Route path="/sabores" element={<RouteErrorBoundary route="/sabores"><Gastronomia /></RouteErrorBoundary>} />
          <Route path="/economia" element={<RouteErrorBoundary route="/economia"><NegociosPortal /></RouteErrorBoundary>} />
          <Route path="/planificador" element={<RouteErrorBoundary route="/planificador"><Rutas /></RouteErrorBoundary>} />
          <Route path="/realito" element={<RouteErrorBoundary route="/realito"><Dashboard /></RouteErrorBoundary>} />
          <Route path="/quienes-somos" element={<RouteErrorBoundary route="/quienes-somos"><QuienesSomos /></RouteErrorBoundary>} />
          <Route path="/donar" element={<RouteErrorBoundary route="/donar"><Donar /></RouteErrorBoundary>} />
          <Route path="/gracias-donativo" element={<RouteErrorBoundary route="/gracias-donativo"><GraciasDonativo /></RouteErrorBoundary>} />
          <Route path="/comercios/panel" element={<RouteErrorBoundary route="/comercios/panel"><ComerciosPanel /></RouteErrorBoundary>} />
          <Route path="/mapa-vivo" element={<RouteErrorBoundary route="/mapa-vivo"><MapaVivo /></RouteErrorBoundary>} />
          <Route path="/registro-comercio" element={<RouteErrorBoundary route="/registro-comercio"><RegistroComercio /></RouteErrorBoundary>} />
          <Route path="/gemelo" element={<Navigate to="/mapa-vivo" replace />} />
          <Route path="/contacto" element={<Navigate to="/quienes-somos" replace />} />
          <Route path="/introduccion" element={<RouteErrorBoundary route="/introduccion"><Introduccion /></RouteErrorBoundary>} />
          <Route path="/filosofia" element={<RouteErrorBoundary route="/filosofia"><Filosofia /></RouteErrorBoundary>} />
          <Route path="/arquitectura" element={<RouteErrorBoundary route="/arquitectura"><Arquitectura /></RouteErrorBoundary>} />
          <Route path="/dominios/:slug" element={<RouteErrorBoundary route="/dominios"><DomainPage /></RouteErrorBoundary>} />
          <Route path="/ia-agentes" element={<RouteErrorBoundary route="/ia-agentes"><IAAgentes /></RouteErrorBoundary>} />
          <Route path="/timeline" element={<RouteErrorBoundary route="/timeline"><Timeline /></RouteErrorBoundary>} />
          <Route path="/documentacion" element={<RouteErrorBoundary route="/documentacion"><Documentacion /></RouteErrorBoundary>} />
          <Route path="/gobernanza" element={<RouteErrorBoundary route="/gobernanza"><Gobernanza /></RouteErrorBoundary>} />
          <Route path="/sistemas-avanzados" element={<RouteErrorBoundary route="/sistemas-avanzados"><SistemasAvanzados /></RouteErrorBoundary>} />
          <Route path="/manuales" element={<RouteErrorBoundary route="/manuales"><Manuales /></RouteErrorBoundary>} />
          <Route path="/despliegue" element={<RouteErrorBoundary route="/despliegue"><Despliegue /></RouteErrorBoundary>} />
          <Route path="/biografia-ceo" element={<RouteErrorBoundary route="/biografia-ceo"><BiografiaCEO /></RouteErrorBoundary>} />
          <Route path="/casos-de-uso" element={<RouteErrorBoundary route="/casos-de-uso"><CasosDeUso /></RouteErrorBoundary>} />
          <Route path="/kit-apis" element={<RouteErrorBoundary route="/kit-apis"><KitAPIs /></RouteErrorBoundary>} />
          <Route path="/estrategia" element={<RouteErrorBoundary route="/estrategia"><Estrategia /></RouteErrorBoundary>} />
          <Route path="/wikitamv" element={<RouteErrorBoundary route="/wikitamv"><WikiTAMV /></RouteErrorBoundary>} />
          <Route path="/red-social" element={<RouteErrorBoundary route="/red-social"><RedSocial /></RouteErrorBoundary>} />
          <Route path="/seguridad-tenochtitlan" element={<RouteErrorBoundary route="/seguridad-tenochtitlan"><SeguridadTenochtitlan /></RouteErrorBoundary>} />
          <Route path="/blockchain-msr" element={<RouteErrorBoundary route="/blockchain-msr"><BlockchainMSR /></RouteErrorBoundary>} />
          <Route path="/xr-tecnologia" element={<RouteErrorBoundary route="/xr-tecnologia"><XRTecnologia /></RouteErrorBoundary>} />
          <Route path="/economia-federada" element={<RouteErrorBoundary route="/economia-federada"><EconomiaFederada /></RouteErrorBoundary>} />
          <Route path="/quantum-computing" element={<RouteErrorBoundary route="/quantum-computing"><QuantumComputing /></RouteErrorBoundary>} />
          <Route path="/enciclopedia" element={<RouteErrorBoundary route="/enciclopedia"><EnciclopediaUniversal /></RouteErrorBoundary>} />
          <Route path="/isabella" element={<Navigate to="/isabella-ai" replace />} />
          <Route path="/isabella-ai" element={<RouteErrorBoundary route="/isabella-ai"><IsabellaAI /></RouteErrorBoundary>} />
          <Route path="/impacto-civilizatorio" element={<RouteErrorBoundary route="/impacto-civilizatorio"><ImpactoCivilizatorio /></RouteErrorBoundary>} />
          <Route path="/documentation" element={<RouteErrorBoundary route="/documentation"><Documentation /></RouteErrorBoundary>} />
          <Route path="/membership" element={<RouteErrorBoundary route="/membership"><Membership /></RouteErrorBoundary>} />
          <Route path="/metaverse" element={<RouteErrorBoundary route="/metaverse"><MetaverseHome /></RouteErrorBoundary>} />
          <Route path="/register" element={<RouteErrorBoundary route="/register"><Register /></RouteErrorBoundary>} />
          <Route path="/login" element={<RouteErrorBoundary route="/login"><Login /></RouteErrorBoundary>} />
          <Route path="/guardian" element={<RouteErrorBoundary route="/guardian"><Guardian /></RouteErrorBoundary>} />
          <Route path="/atlas" element={<RouteErrorBoundary route="/atlas"><Atlas /></RouteErrorBoundary>} />
          <Route path="/devhub" element={<RouteErrorBoundary route="/devhub"><DevHub /></RouteErrorBoundary>} />
          <Route path="/feed" element={<RouteErrorBoundary route="/feed"><Feed /></RouteErrorBoundary>} />
          <Route path="/territorial-dashboard" element={<RouteErrorBoundary route="/territorial-dashboard"><TerritorialDashboard /></RouteErrorBoundary>} />
          <Route path="/estacionamientos" element={<RouteErrorBoundary route="/estacionamientos"><Estacionamientos /></RouteErrorBoundary>} />
          <Route path="/patrimonio-cultural" element={<RouteErrorBoundary route="/patrimonio-cultural"><PatrimonioCultural /></RouteErrorBoundary>} />
          <Route path="/capitulos" element={<RouteErrorBoundary route="/capitulos"><AtlasCapitulos /></RouteErrorBoundary>} />
          <Route path="/capitulos/minas" element={<RouteErrorBoundary route="/capitulos/minas"><AtlasMinas /></RouteErrorBoundary>} />
          <Route path="/capitulos/pastes" element={<RouteErrorBoundary route="/capitulos/pastes"><AtlasPastes /></RouteErrorBoundary>} />
          <Route path="/capitulos/cementerio" element={<RouteErrorBoundary route="/capitulos/cementerio"><AtlasCementerio /></RouteErrorBoundary>} />
          <Route path="/capitulos/calles" element={<RouteErrorBoundary route="/capitulos/calles"><AtlasCalles /></RouteErrorBoundary>} />
          <Route path="/capitulos/leyendas" element={<RouteErrorBoundary route="/capitulos/leyendas"><AtlasLeyendas /></RouteErrorBoundary>} />
          <Route path="/atlas-maximus" element={<RouteErrorBoundary route="/atlas-maximus"><AtlasMaximus /></RouteErrorBoundary>} />
          <Route path="/corpus" element={<RouteErrorBoundary route="/corpus"><AtlasMaximus /></RouteErrorBoundary>} />
          <Route path="/ecosistema-ltos" element={<RouteErrorBoundary route="/ecosistema-ltos"><EcosistemaLTOS /></RouteErrorBoundary>} />
          <Route path="/repos" element={<RouteErrorBoundary route="/repos"><EcosistemaLTOS /></RouteErrorBoundary>} />
          <Route path="/perfil" element={<RouteErrorBoundary route="/perfil"><Perfil /></RouteErrorBoundary>} />
          <Route path="/leaderboard" element={<RouteErrorBoundary route="/leaderboard"><Leaderboard /></RouteErrorBoundary>} />
          <Route path="/ranking" element={<RouteErrorBoundary route="/ranking"><Leaderboard /></RouteErrorBoundary>} />
          {/* === Absorbed routes === */}
          <Route path="/wiki" element={<RouteErrorBoundary route="/wiki"><Wiki /></RouteErrorBoundary>} />
          <Route path="/control" element={<RouteErrorBoundary route="/control"><ControlCenter /></RouteErrorBoundary>} />
          <Route path="/b2b" element={<RouteErrorBoundary route="/b2b"><B2BPortal /></RouteErrorBoundary>} />
          <Route path="/games" element={<RouteErrorBoundary route="/games"><GamePortal /></RouteErrorBoundary>} />
          <Route path="/juegos" element={<RouteErrorBoundary route="/juegos"><Juegos /></RouteErrorBoundary>} />
          <Route path="/ltos" element={<RouteErrorBoundary route="/ltos"><LTOS /></RouteErrorBoundary>} />
          <Route path="/mitos" element={<RouteErrorBoundary route="/mitos"><Mitos /></RouteErrorBoundary>} />
          <Route path="/musica/:slug" element={<RouteErrorBoundary route="/musica/:slug"><MusicDetail /></RouteErrorBoundary>} />
          <Route path="/recorridos" element={<RouteErrorBoundary route="/recorridos"><Recorridos /></RouteErrorBoundary>} />
          <Route path="/registrar-comercio-v2" element={<RouteErrorBoundary route="/registrar-comercio-v2"><RegistrarComercioPage /></RouteErrorBoundary>} />
          <Route path="/ruta-del-paste" element={<RouteErrorBoundary route="/ruta-del-paste"><RutaDelPaste /></RouteErrorBoundary>} />
          <Route path="/admin-panel" element={<RouteErrorBoundary route="/admin-panel"><AdminPanel /></RouteErrorBoundary>} />
          <Route path="/demo-checklist" element={<RouteErrorBoundary route="/demo-checklist"><DemoChecklist /></RouteErrorBoundary>} />
          <Route path="/realito-ai" element={<RouteErrorBoundary route="/realito-ai"><RealitoAIPage /></RouteErrorBoundary>} />
          <Route path="/archivo-sonoro" element={<RouteErrorBoundary route="/archivo-sonoro"><ArchivoSonoro /></RouteErrorBoundary>} />
          <Route path="/comercios/checkout" element={<RouteErrorBoundary route="/comercios/checkout"><ComerciosCheckout /></RouteErrorBoundary>} />
          <Route path="/comercios/registro-v2" element={<RouteErrorBoundary route="/comercios/registro-v2"><ComerciosRegistroPage /></RouteErrorBoundary>} />
          <Route path="/evolucion" element={<RouteErrorBoundary route="/evolucion"><Evolucion /></RouteErrorBoundary>} />
          <Route path="/faq" element={<RouteErrorBoundary route="/faq"><FAQ /></RouteErrorBoundary>} />
          <Route path="/fusion-ecosystem" element={<RouteErrorBoundary route="/fusion-ecosystem"><FusionEcosystem /></RouteErrorBoundary>} />
          <Route path="/membresias" element={<RouteErrorBoundary route="/membresias"><Membresias /></RouteErrorBoundary>} />
          <Route path="/premium" element={<RouteErrorBoundary route="/premium"><PremiumPlans /></RouteErrorBoundary>} />
          <Route path="/mina" element={<RouteErrorBoundary route="/mina"><Mina /></RouteErrorBoundary>} />
          <Route path="/operativo" element={<RouteErrorBoundary route="/operativo"><Operativo /></RouteErrorBoundary>} />
          <Route path="/tamv-api" element={<RouteErrorBoundary route="/tamv-api"><TAMVApiExplorer /></RouteErrorBoundary>} />
          <Route path="/tamv-hub" element={<RouteErrorBoundary route="/tamv-hub"><TAMVHub /></RouteErrorBoundary>} />
          <Route path="/tamv-status" element={<RouteErrorBoundary route="/tamv-status"><TAMVStatus /></RouteErrorBoundary>} />
          <Route path="/tamv-thesis" element={<RouteErrorBoundary route="/tamv-thesis"><TAMVThesis /></RouteErrorBoundary>} />
          <Route path="/tenochtitlan" element={<RouteErrorBoundary route="/tenochtitlan"><Tenochtitlan /></RouteErrorBoundary>} />
          <Route path="/rfcs" element={<RouteErrorBoundary route="/rfcs"><RFCList /></RouteErrorBoundary>} />
          <Route path="/rfc/:id" element={<RouteErrorBoundary route="/rfc/:id"><RFCDetail /></RouteErrorBoundary>} />
          <Route path="/telemetry" element={<RouteErrorBoundary route="/telemetry"><TelemetryDashboard /></RouteErrorBoundary>} />
          <Route path="*" element={<RouteErrorBoundary route="*"><NotFound /></RouteErrorBoundary>} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  )
}

// Error boundary that catches CinematicIntro errors and unblocks main content
class CinematicIntroSafe extends Component<
  { onEnter: () => void },
  { hasError: boolean }
> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // Unblock main content on error
    setTimeout(() => this.props.onEnter(), 0)
  }

  render() {
    if (this.state.hasError) return null
    return <CinematicIntro onEnter={this.props.onEnter} />
  }
}

const AppInner = () => {
  const [introComplete, setIntroComplete] = useState(false)

  const [showIntro] = useState(() => {
    const isBrowser = typeof window !== 'undefined'
    if (!isBrowser) {
      return false
    }

    // Solo mostrar CinematicIntro en la landing page /
    if (window.location.pathname !== '/') return false

    if (sessionStorage.getItem('rdm_intro_shown')) return false
    sessionStorage.setItem('rdm_intro_shown', 'true')
    return true
  })

  const handleIntroComplete = useCallback(() => {
    setIntroComplete(true)
  }, [])

  // Safety net: if CinematicIntro fails to load or never calls onEnter,
  // force-complete after 5s so main content always renders
  useEffect(() => {
    if (showIntro && !introComplete) {
      const timer = setTimeout(() => setIntroComplete(true), 5000)
      return () => clearTimeout(timer)
    }
  }, [showIntro, introComplete])

  // Analytics post-pintado: se montan vía requestIdleCallback para no bloquear el main thread
  const [analyticsReady, setAnalyticsReady] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined') return
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => setAnalyticsReady(true), { timeout: 4000 })
    } else {
      setTimeout(() => setAnalyticsReady(true), 3000)
    }
  }, [])

  // Arranque dinámico de Isabella AI — FusionEngine se importa bajo demanda
  useEffect(() => {
    const isBrowser = typeof window !== 'undefined'
    if (!isBrowser) return
    import('@/core/territorial/TerritorialFusionEngine').then(({ fusionEngine }) => {
      fusionEngine.start()
    }).catch((err) => {
      console.error('[FUSION ENGINE]', err)
      captureException(err, { module: 'TerritorialFusionEngine' })
    })
  }, [])

  return (
    <ErrorBoundary>
      <TooltipProvider>
        <Suspense fallback={<LoadingFallback />}><AmbientLayer /></Suspense>
        {/* Banner global de estado de auth/Supabase */}
        <AuthStatusBanner />
        <Toaster />
        <Sonner />
        <AnimatePresence>
          {showIntro && !introComplete && (
            <Suspense fallback={<LoadingFallback />}>
              <CinematicIntroSafe onEnter={handleIntroComplete} />
            </Suspense>
          )}
        </AnimatePresence>
          {(!showIntro || introComplete) && (
            <>
              <AudioPlayerProvider>
                <Suspense fallback={<LoadingFallback />}><MicroPageIntro /></Suspense>
                <AnimatedRoutes />
                <Suspense fallback={<LoadingFallback />}><GlobalPlayerBar /></Suspense>
                <Suspense fallback={<LoadingFallback />}><LiveTelemetryBadge /></Suspense>
                <Suspense fallback={<LoadingFallback />}><SearchOverlay /></Suspense>
                {/* CompassNav disabled — RDMNavbar now covers all navigation */}
                <Suspense fallback={<LoadingFallback />}><SmartSidebar /></Suspense>
              </AudioPlayerProvider>
            </>
          )}
          <Suspense fallback={<LoadingFallback />}><RealitoChatLauncher /></Suspense>
          {/* SpeedInsights + Analytics: diferidos al primer idle del navegador */}
          {analyticsReady && (
            <Suspense fallback={<LoadingFallback />}>
              <SpeedInsights />
              <Analytics debug={import.meta.env.DEV} />
            </Suspense>
          )}
      </TooltipProvider>
    </ErrorBoundary>
  )
}

const App = () => {
  return (
    <AppCrashBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <RDMAuthProvider>
            <NotificationProvider>
              <AppInner />
            </NotificationProvider>
          </RDMAuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </AppCrashBoundary>
  )
}

export default App
