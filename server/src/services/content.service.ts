// ============================================================================
// RDM Digital OS — Tourism Domain v2
// Rutas y eventos turísticos tipados y listos para tiempo real
// ============================================================================

export type RouteDifficulty = "Fácil" | "Moderada" | "Avanzada";

export type RouteGradientToken =
  | "from-primary to-cyan-300"
  | "from-secondary to-orange-300"
  | "from-emerald-400 to-teal-300";

export interface TourismRouteRecord {
  id: string;
  name: string;
  description: string;
  difficulty: RouteDifficulty;
  duration: string; // ej. "2-3 horas"
  distance: string; // ej. "4.2 km"
  points: string[];
  /**
   * Token de gradiente compatible con el design system (Tailwind / CSS).
   * No es un color arbitrario.
   */
  color: RouteGradientToken;
  /**
   * Icono corto (puede ser emoji o un nombre de icono del sistema).
   */
  icon: string;
}

export interface TourismEventRecord {
  id: string;
  title: string;
  description: string;
  startDate: string; // ISO-8601
  endDate: string; // ISO-8601
  location: string;
  isFeatured: boolean;
}

/**
 * Datos inmutables para evitar mutaciones accidentales en runtime.
 */
const tourismRoutes: readonly TourismRouteRecord[] = [
  {
    id: "ruta-patrimonio",
    name: "Ruta del Patrimonio Minero",
    description: "Recorre minas históricas, plazas y arquitectura emblemática.",
    difficulty: "Fácil",
    duration: "2-3 horas",
    distance: "4.2 km",
    points: ["Mina La Acosta", "Plaza Principal", "Panteón Inglés"],
    color: "from-primary to-cyan-300",
    icon: "⛏️",
  },
  {
    id: "ruta-gastronomica",
    name: "Ruta Gastronómica del Paste",
    description:
      "Sabores tradicionales y cocina local en el corazón del pueblo.",
    difficulty: "Fácil",
    duration: "2 horas",
    distance: "2.1 km",
    points: ["Pastes El Portal", "Mercado Municipal", "Cafeterías históricas"],
    color: "from-secondary to-orange-300",
    icon: "🥟",
  },
  {
    id: "ruta-ecoaventura",
    name: "Ruta EcoAventura",
    description: "Senderos y miradores para experiencias al aire libre.",
    difficulty: "Moderada",
    duration: "4 horas",
    distance: "8.4 km",
    points: ["Peña del Zumate", "Bosque de Oyamel", "Mirador Sierra Alta"],
    color: "from-emerald-400 to-teal-300",
    icon: "🌲",
  },
] as const;

const tourismEvents: readonly TourismEventRecord[] = [
  {
    id: "festival-plata",
    title: "Festival de la Plata y la Memoria Minera",
    description:
      "Música, talleres y narrativa histórica sobre el legado minero de RDM.",
    startDate: "2026-07-21T10:00:00.000Z",
    endDate: "2026-07-23T22:00:00.000Z",
    location: "Centro Histórico",
    isFeatured: true,
  },
  {
    id: "noche-leyendas",
    title: "Noche de Leyendas y Callejones",
    description:
      "Recorridos escénicos nocturnos con historias locales y tradición oral.",
    startDate: "2026-08-03T19:00:00.000Z",
    endDate: "2026-08-03T22:30:00.000Z",
    location: "Barrio Minero",
    isFeatured: false,
  },
  {
    id: "feria-paste",
    title: "Feria del Paste",
    description:
      "Encuentro gastronómico con productores locales y actividades familiares.",
    startDate: "2026-10-14T11:00:00.000Z",
    endDate: "2026-10-16T20:00:00.000Z",
    location: "Explanada Municipal",
    isFeatured: true,
  },
] as const;

// ============================================================================
// Read‑only accessors
// ============================================================================

export function listTourismRoutes(): readonly TourismRouteRecord[] {
  // Devolvemos la referencia readonly para evitar mutación externa.
  return tourismRoutes;
}

export function listTourismEvents(): readonly TourismEventRecord[] {
  return tourismEvents;
}

// ============================================================================
// Helpers de tiempo real (latencia baja, operaciones O(n))
// ============================================================================

/**
 * Devuelve solo los eventos que están activos en "ahora".
 */
export function listActiveTourismEvents(
  now: Date = new Date(),
): TourismEventRecord[] {
  const t = now.getTime();
  return tourismEvents.filter((event) => {
    const start = Date.parse(event.startDate);
    const end = Date.parse(event.endDate);
    if (Number.isNaN(start) || Number.isNaN(end)) return false;
    return start <= t && t <= end;
  });
}

/**
 * Devuelve los próximos eventos ordenados cronológicamente.
 */
export function listUpcomingTourismEvents(
  now: Date = new Date(),
): TourismEventRecord[] {
  const t = now.getTime();
  return tourismEvents
    .filter((event) => {
      const start = Date.parse(event.startDate);
      return !Number.isNaN(start) && start > t;
    })
    .slice()
    .sort((a, b) => Date.parse(a.startDate) - Date.parse(b.startDate));
}

/**
 * Devuelve solo eventos destacados (featured),
 * útil para el nodo cero / carrusel principal.
 */
export function listFeaturedTourismEvents(): TourismEventRecord[] {
  return tourismEvents.filter((event) => event.isFeatured);
}

/**
 * Búsqueda segura por id (evita undefined no controlados).
 */
export function findTourismRouteById(
  id: string,
): TourismRouteRecord | null {
  return tourismRoutes.find((route) => route.id === id) ?? null;
}

export function findTourismEventById(
  id: string,
): TourismEventRecord | null {
  return tourismEvents.find((event) => event.id === id) ?? null;
}
