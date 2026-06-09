import { useState, useCallback, lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import ErrorBoundary from "@/components/ErrorBoundary";
import CinematicIntro from "@/components/CinematicIntro";
import MicroPageIntro from "@/components/MicroPageIntro";
import RealitoChatLauncher from "./components/RealitoChatLauncher";
import AmbientLayer from "@/components/AmbientLayer";
import LiveTelemetryBadge from "@/components/LiveTelemetryBadge";
import { RDMAuthProvider } from "@/contexts/RDMAuthContext";

// ===== Mother repo pages =====
const Index = lazy(() => import("./pages/Index"));
const Lugares = lazy(() => import("./pages/Lugares"));
const Directorio = lazy(() => import("./pages/Directorio"));
const Eventos = lazy(() => import("./pages/Eventos"));
const Comunidad = lazy(() => import("./pages/Comunidad"));
const Mapa = lazy(() => import("./pages/Mapa"));
const Historia = lazy(() => import("./pages/Historia"));
const Cultura = lazy(() => import("./pages/Cultura"));
const Relatos = lazy(() => import("./pages/Relatos"));
const Ecoturismo = lazy(() => import("./pages/Ecoturismo"));
const Gastronomia = lazy(() => import("./pages/Gastronomia"));
const Arte = lazy(() => import("./pages/Arte"));
const Rutas = lazy(() => import("./pages/Rutas"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Auth = lazy(() => import("./pages/Auth"));
const Apoya = lazy(() => import("./pages/Apoya"));
const Reglamento = lazy(() => import("./pages/Reglamento"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const Dichos = lazy(() => import("./pages/Dichos"));
const Catalogo = lazy(() => import("./pages/Catalogo"));
const NegociosPortal = lazy(() => import("./pages/NegociosPortal"));

// ===== Smart City OS pages =====
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Comercios = lazy(() => import("./pages/Comercios"));
const Paquetes = lazy(() => import("./pages/Paquetes"));
const ComunidadPage = lazy(() => import("./pages/ComunidadPage"));
const TransporteLocal = lazy(() => import("./pages/TransporteLocal"));
const ShuttleCDMX = lazy(() => import("./pages/ShuttleCDMX"));

// ===== RDM Digital-X pages =====
const QuienesSomos = lazy(() => import("./pages/QuienesSomos"));
const Donar = lazy(() => import("./pages/Donar"));
const GraciasDonativo = lazy(() => import("./pages/GraciasDonativo"));
const ComerciosPanel = lazy(() => import("./pages/ComerciosPanel"));

// ===== Elevated pages =====
const MapaVivo = lazy(() => import("./pages/MapaVivo"));
const RegistroComercio = lazy(() => import("./pages/RegistroComercio"));

// ===== Citemesh / Wiki pages =====
const Introduccion = lazy(() => import("./pages/Introduccion"));
const Filosofia = lazy(() => import("./pages/Filosofia"));
const Arquitectura = lazy(() => import("./pages/Arquitectura"));
const DomainPage = lazy(() => import("./pages/DomainPage"));
const IAAgentes = lazy(() => import("./pages/IAAgentes"));
const Timeline = lazy(() => import("./pages/Timeline"));
const Documentacion = lazy(() => import("./pages/Documentacion"));
const Gobernanza = lazy(() => import("./pages/Gobernanza"));
const SistemasAvanzados = lazy(() => import("./pages/SistemasAvanzados"));
const Manuales = lazy(() => import("./pages/Manuales"));
const Despliegue = lazy(() => import("./pages/Despliegue"));
const BiografiaCEO = lazy(() => import("./pages/BiografiaCEO"));
const CasosDeUso = lazy(() => import("./pages/CasosDeUso"));
const KitAPIs = lazy(() => import("./pages/KitAPIs"));
const Estrategia = lazy(() => import("./pages/Estrategia"));
const WikiTAMV = lazy(() => import("./pages/WikiTAMV"));
const RedSocial = lazy(() => import("./pages/RedSocial"));
const SeguridadTenochtitlan = lazy(() => import("./pages/SeguridadTenochtitlan"));
const BlockchainMSR = lazy(() => import("./pages/BlockchainMSR"));
const XRTecnologia = lazy(() => import("./pages/XRTecnologia"));
const EconomiaFederada = lazy(() => import("./pages/EconomiaFederada"));
const QuantumComputing = lazy(() => import("./pages/QuantumComputing"));
const EnciclopediaUniversal = lazy(() => import("./pages/EnciclopediaUniversal"));
const IsabellaAI = lazy(() => import("./pages/IsabellaAI"));
const ImpactoCivilizatorio = lazy(() => import("./pages/ImpactoCivilizatorio"));

// ===== Genesis / TAMV pages =====
const Documentation = lazy(() => import("./pages/Documentation"));
const Membership = lazy(() => import("./pages/Membership"));
const MetaverseHome = lazy(() => import("./pages/MetaverseHome"));
const Register = lazy(() => import("./pages/Register"));
const Login = lazy(() => import("./pages/Login"));

// ===== Civilizational Core pages =====
const Guardian = lazy(() => import("./pages/Guardian"));
const Atlas = lazy(() => import("./pages/Atlas"));
const DevHub = lazy(() => import("./pages/DevHub"));
const Feed = lazy(() => import("./pages/Feed"));

// ===== New Tourism pages =====
const Estacionamientos = lazy(() => import("./pages/Estacionamientos"));
const PatrimonioCultural = lazy(() => import("./pages/PatrimonioCultural"));

// ===== Atlas territorial chapters (integrado de real-del-monte-atlas) =====
const AtlasCapitulos = lazy(() => import("./pages/AtlasCapitulos"));
const AtlasMinas = lazy(() => import("./pages/AtlasMinas"));
const AtlasPastes = lazy(() => import("./pages/AtlasPastes"));
const AtlasCementerio = lazy(() => import("./pages/AtlasCementerio"));
const AtlasCalles = lazy(() => import("./pages/AtlasCalles"));
const AtlasLeyendas = lazy(() => import("./pages/AtlasLeyendas"));
const AtlasMaximus = lazy(() => import("./pages/AtlasMaximus"));
const EcosistemaLTOS = lazy(() => import("./pages/EcosistemaLTOS"));
const Perfil = lazy(() => import("./pages/Perfil"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const RouteFallback = () => (
  <div className="min-h-screen w-full animate-pulse bg-background" aria-label="Cargando contenido" />
);

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<RouteFallback />}>
        <Routes location={location} key={location.pathname}>
          {/* === Core RDM Routes === */}
          <Route path="/" element={<Index />} />
          <Route path="/mapa" element={<Mapa />} />
          <Route path="/lugares" element={<Lugares />} />
          <Route path="/directorio" element={<Directorio />} />
          <Route path="/eventos" element={<Eventos />} />
          <Route path="/comunidad" element={<Comunidad />} />
          <Route path="/historia" element={<Historia />} />
          <Route path="/cultura" element={<Cultura />} />
          <Route path="/relatos" element={<Relatos />} />
          <Route path="/ecoturismo" element={<Ecoturismo />} />
          <Route path="/gastronomia" element={<Gastronomia />} />
          <Route path="/arte" element={<Arte />} />
          <Route path="/rutas" element={<Rutas />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/apoya" element={<Apoya />} />
          <Route path="/reglamento" element={<Reglamento />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/dichos" element={<Dichos />} />
          <Route path="/dichos-mineros" element={<Dichos />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/negocios" element={<NegociosPortal />} />

          {/* === Smart City OS Routes === */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/comercios" element={<Comercios />} />
          <Route path="/paquetes" element={<Paquetes />} />
          <Route path="/comunidad-social" element={<ComunidadPage />} />
          <Route path="/transporte-local" element={<TransporteLocal />} />
          <Route path="/shuttle-cdmx-rdm" element={<ShuttleCDMX />} />
          <Route path="/explorar" element={<Mapa />} />
          <Route path="/experiencias" element={<Rutas />} />
          <Route path="/patrimonio" element={<Cultura />} />
          <Route path="/sabores" element={<Gastronomia />} />
          <Route path="/economia" element={<NegociosPortal />} />
          <Route path="/planificador" element={<Rutas />} />
          <Route path="/realito" element={<Dashboard />} />

          {/* === Digital-X Routes === */}
          <Route path="/quienes-somos" element={<QuienesSomos />} />
          <Route path="/donar" element={<Donar />} />
          <Route path="/gracias-donativo" element={<GraciasDonativo />} />
          <Route path="/comercios/panel" element={<ComerciosPanel />} />

          {/* === Elevated Routes === */}
          <Route path="/mapa-vivo" element={<MapaVivo />} />
          <Route path="/registro-comercio" element={<RegistroComercio />} />

          {/* === Citemesh / Wiki Routes === */}
          <Route path="/introduccion" element={<Introduccion />} />
          <Route path="/filosofia" element={<Filosofia />} />
          <Route path="/arquitectura" element={<Arquitectura />} />
          <Route path="/dominios/:slug" element={<DomainPage />} />
          <Route path="/ia-agentes" element={<IAAgentes />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/documentacion" element={<Documentacion />} />
          <Route path="/gobernanza" element={<Gobernanza />} />
          <Route path="/sistemas-avanzados" element={<SistemasAvanzados />} />
          <Route path="/manuales" element={<Manuales />} />
          <Route path="/despliegue" element={<Despliegue />} />
          <Route path="/biografia-ceo" element={<BiografiaCEO />} />
          <Route path="/casos-de-uso" element={<CasosDeUso />} />
          <Route path="/kit-apis" element={<KitAPIs />} />
          <Route path="/estrategia" element={<Estrategia />} />
          <Route path="/wikitamv" element={<WikiTAMV />} />
          <Route path="/red-social" element={<RedSocial />} />
          <Route path="/seguridad-tenochtitlan" element={<SeguridadTenochtitlan />} />
          <Route path="/blockchain-msr" element={<BlockchainMSR />} />
          <Route path="/xr-tecnologia" element={<XRTecnologia />} />
          <Route path="/economia-federada" element={<EconomiaFederada />} />
          <Route path="/quantum-computing" element={<QuantumComputing />} />
          <Route path="/enciclopedia" element={<EnciclopediaUniversal />} />
          <Route path="/isabella-ai" element={<IsabellaAI />} />
          <Route path="/impacto-civilizatorio" element={<ImpactoCivilizatorio />} />

          {/* === Genesis / TAMV Routes === */}
          <Route path="/documentation" element={<Documentation />} />
          <Route path="/membership" element={<Membership />} />
          <Route path="/metaverse" element={<MetaverseHome />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* === Civilizational Core Routes === */}
          <Route path="/guardian" element={<Guardian />} />
          <Route path="/atlas" element={<Atlas />} />
          <Route path="/devhub" element={<DevHub />} />
          <Route path="/feed" element={<Feed />} />

          {/* === New Tourism Routes === */}
          <Route path="/estacionamientos" element={<Estacionamientos />} />
          <Route path="/patrimonio-cultural" element={<PatrimonioCultural />} />

          {/* === Atlas territorial (capítulos narrativos) === */}
          <Route path="/capitulos" element={<AtlasCapitulos />} />
          <Route path="/capitulos/minas" element={<AtlasMinas />} />
          <Route path="/capitulos/pastes" element={<AtlasPastes />} />
          <Route path="/capitulos/cementerio" element={<AtlasCementerio />} />
          <Route path="/capitulos/calles" element={<AtlasCalles />} />
          <Route path="/capitulos/leyendas" element={<AtlasLeyendas />} />
          <Route path="/atlas-maximus" element={<AtlasMaximus />} />
          <Route path="/corpus" element={<AtlasMaximus />} />
          <Route path="/ecosistema-ltos" element={<EcosistemaLTOS />} />
          <Route path="/repos" element={<EcosistemaLTOS />} />

          {/* === Auth + Gamification === */}
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/ranking" element={<Leaderboard />} />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
};

const AppInner = () => {
  const [introComplete, setIntroComplete] = useState(false);

  const handleIntroComplete = useCallback(() => {
    setIntroComplete(true);
  }, []);

  const [showIntro] = useState(() => {
    if (sessionStorage.getItem("rdm_intro_shown")) return false;
    sessionStorage.setItem("rdm_intro_shown", "true");
    return true;
  });

  return (
    <ErrorBoundary>
      <TooltipProvider>
        <AmbientLayer />
        <Toaster />
        <Sonner />
        {showIntro && !introComplete && (
          <CinematicIntro onComplete={handleIntroComplete} />
        )}
        {(!showIntro || introComplete) && (
          <>
            <MicroPageIntro />
            <AnimatedRoutes />
            <LiveTelemetryBadge />
          </>
        )}
        <RealitoChatLauncher />
      </TooltipProvider>
    </ErrorBoundary>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <RDMAuthProvider>
          <AppInner />
        </RDMAuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
