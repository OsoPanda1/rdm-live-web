import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useLocation } from "react-router-dom";

const ROUTE_LABELS: Record<string, string> = {
  "/": "Inicio",
  "/mapa": "Mapa Inteligente",
  "/rutas": "Rutas Turísticas",
  "/lugares": "Lugares Imperdibles",
  "/directorio": "Directorio Local",
  "/eventos": "Agenda Cultural",
  "/comunidad": "Comunidad",
  "/historia": "Historia Minera",
  "/cultura": "Cultura Viva",
  "/relatos": "Relatos y Leyendas",
  "/ecoturismo": "Ecoturismo y Naturaleza",
  "/gastronomia": "Gastronomía",
  "/arte": "Arte y Artesanías",
  "/dichos": "Dichos Mineros",
  "/dichos-mineros": "Dichos Mineros",
  "/catalogo": "Catálogo",
  "/negocios": "Portal de Negocios",
  "/apoya": "Apoya RDM",
  "/patrimonio-cultural": "Patrimonio Cultural",
  "/estacionamientos": "Dónde Estacionar",
  "/registro-comercio": "Registra tu Comercio",
  "/comercios": "Directorio Comercial",
  "/quienes-somos": "Quiénes Somos",
  "/biografia-ceo": "Biografía del Fundador",
  "/arquitectura": "Arquitectura del Sistema",
  "/seguridad-tenochtitlan": "Seguridad TENOCHTITLAN",
  "/paquetes": "Paquetes Turísticos",
  "/transporte-local": "Transporte Local",
  "/shuttle-cdmx-rdm": "Shuttle CDMX ↔ RDM",
  "/donar": "Dona al Proyecto",
  "/experiencias": "Experiencias",
};

export default function MicroPageIntro() {
  const location = useLocation();
  const [visible, setVisible] = useState(false);

  const label = useMemo(() => ROUTE_LABELS[location.pathname] ?? null, [location.pathname]);

  useEffect(() => {
    if (!label) return;
    setVisible(true);
    const id = window.setTimeout(() => setVisible(false), 2400);
    return () => window.clearTimeout(id);
  }, [location.pathname, label]);

  if (!label) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: -20, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -14, filter: "blur(8px)" }}
          transition={{ duration: 0.35 }}
          className="pointer-events-none fixed left-1/2 top-20 z-[60] w-[92vw] max-w-md -translate-x-1/2"
        >
          <div className="rounded-2xl border border-[hsl(var(--border)/0.3)] bg-[hsl(var(--card)/0.9)] px-4 py-3 shadow-lg backdrop-blur-xl">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.22em] text-[hsl(var(--muted-foreground))]">Navegando</p>
                <p className="truncate text-base font-semibold text-[hsl(var(--foreground))]" style={{ fontFamily: "var(--font-display)" }}>{label}</p>
              </div>
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--rdm-amber)/0.15)] text-[hsl(var(--rdm-amber))]">
                <Sparkles className="h-4 w-4" />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
