// src/data/rewards-catalog.ts
// Catálogo de premios reales canjeables por puntos de gamificación
// Los premios son aportados por comercios federados de Real del Monte

export interface RewardItem {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  monetaryValue: number;
  category: "gastronomia" | "artesania" | "experiencia" | "hospedaje" | "tour";
  business: string;
  businessIcon: string;
  stock: number;
  image?: string;
}

export const REWARDS_CATALOG: RewardItem[] = [
  // ── GASTRONOMÍA ──
  {
    id: "paste-001",
    title: "Paste tradicional (2 pz)",
    description: "Dos pastes tradicionales de la mina: papa con carne y chile rojo. Cortesía de El Portal.",
    pointsCost: 150,
    monetaryValue: 60,
    category: "gastronomia",
    business: "El Portal",
    businessIcon: "🥟",
    stock: 200,
  },
  {
    id: "paste-002",
    title: "Paste de temporada + refresco",
    description: "Paste artesanal de mole o tinga acompañado de refresco. En Real Cornish.",
    pointsCost: 250,
    monetaryValue: 90,
    category: "gastronomia",
    business: "Real Cornish",
    businessIcon: "🥟",
    stock: 150,
  },
  {
    id: "michelada-001",
    title: "Michelada tradicional",
    description: "Michelada preparada con cerveza de barril, jugo de limón, sal de gusano y chamoy. En La Minita.",
    pointsCost: 200,
    monetaryValue: 75,
    category: "gastronomia",
    business: "La Minita",
    businessIcon: "🍺",
    stock: 100,
  },
  {
    id: "michelada-002",
    title: "Michelada premium + botana",
    description: "Michelada premium con cerveza artesanal local, acompañada de botana minera. En El Boleo.",
    pointsCost: 350,
    monetaryValue: 130,
    category: "gastronomia",
    business: "El Boleo",
    businessIcon: "🍺",
    stock: 80,
  },
  {
    id: "cena-001",
    title: "Cena romántica para 2",
    description: "Cena de tres tiempos para dos personas: entrada, plato fuerte (filete o trucha) y postre. Vela, música y vista al cerro. En Mirador del Mineral.",
    pointsCost: 1500,
    monetaryValue: 650,
    category: "experiencia",
    business: "Mirador del Mineral",
    businessIcon: "🍽️",
    stock: 15,
  },
  {
    id: "cena-002",
    title: "Noche de fondue + vino",
    description: "Fondue de queso o chocolate para dos personas con copa de vino de la casa. En La Terraza del Conde.",
    pointsCost: 1000,
    monetaryValue: 420,
    category: "experiencia",
    business: "La Terraza del Conde",
    businessIcon: "🍷",
    stock: 20,
  },

  // ── ARTESANÍA / JOYERÍA ──
  {
    id: "plata-001",
    title: "Llavero de plata ley 0.925",
    description: "Llavero artesanal con diseño minero: pico, vagoneta o cruz de mina. Plata ley 0.925. Hecho en Real del Monte.",
    pointsCost: 500,
    monetaryValue: 180,
    category: "artesania",
    business: "Platería RDM",
    businessIcon: "🔱",
    stock: 50,
  },
  {
    id: "plata-002",
    title: "Dije de plata — Corazón minero",
    description: "Dije de plata con forma de corazón y detalle de vagoneta minera. Cadena incluida. Plata ley 0.925.",
    pointsCost: 1200,
    monetaryValue: 480,
    category: "artesania",
    business: "Orfebre del Monte",
    businessIcon: "💍",
    stock: 25,
  },
  {
    id: "plata-003",
    title: "Pulsera de plata — Hilo minero",
    description: "Pulsera tejida con hilo de plata y cierre artesanal. Diseño único inspirado en los cables del malacate.",
    pointsCost: 800,
    monetaryValue: 320,
    category: "artesania",
    business: "Platería RDM",
    businessIcon: "🔱",
    stock: 30,
  },
  {
    id: "artesania-001",
    title: "Miniatura de vagoneta minera",
    description: "Vagoneta decorativa hecha a mano en hoja de lata reciclada. Pintada con colores tradicionales.",
    pointsCost: 400,
    monetaryValue: 150,
    category: "artesania",
    business: "Artesanías del Mineral",
    businessIcon: "🎨",
    stock: 40,
  },

  // ── HOSPEDAJE ──
  {
    id: "hospedaje-001",
    title: "1 noche — Habitación estándar",
    description: "Una noche de hospedaje en habitación estándar para 2 personas. Incluye desayuno. En Hotel Real de Monte.",
    pointsCost: 3000,
    monetaryValue: 1200,
    category: "hospedaje",
    business: "Hotel Real de Monte",
    businessIcon: "🏨",
    stock: 10,
  },
  {
    id: "hospedaje-002",
    title: "1 noche — Suite con chimenea",
    description: "Suite con chimenea, tina de hidromasaje y vista a la sierra. Incluye desayuno y botella de vino. En Hacienda del Mineral.",
    pointsCost: 5000,
    monetaryValue: 2200,
    category: "hospedaje",
    business: "Hacienda del Mineral",
    businessIcon: "🏰",
    stock: 5,
  },
  {
    id: "hospedaje-003",
    title: "Fin de semana en cabaña (2 noches)",
    description: "Dos noches en cabaña para 2 personas con fogata, desayuno campestre y recorrido guiado incluido.",
    pointsCost: 8000,
    monetaryValue: 3500,
    category: "hospedaje",
    business: "Cabañas del Cerrito",
    businessIcon: "🏡",
    stock: 3,
  },

  // ── TOURS / RECORRIDOS ──
  {
    id: "tour-001",
    title: "Recorrido guiado — Centro histórico",
    description: "Tour guiado a pie por el centro histórico: Plaza Principal, Panteón Inglés, Mina de Acosta y Barrio Inglés. 2 horas.",
    pointsCost: 300,
    monetaryValue: 120,
    category: "tour",
    business: "Rutas del Mineral",
    businessIcon: "🚶",
    stock: 100,
  },
  {
    id: "tour-002",
    title: "Tour de pastes — 3 pasterías",
    description: "Recorrido por tres pasterías tradicionales con degustación en cada una. Incluye transporte del centro. 3 horas.",
    pointsCost: 600,
    monetaryValue: 250,
    category: "tour",
    business: "Ruta del Paste",
    businessIcon: "🥟",
    stock: 50,
  },
  {
    id: "tour-003",
    title: "Tour nocturno — Leyendas y mitos",
    description: "Recorrido nocturno por las calles empedradas contando las leyendas del mineral. Linterna y café de olla incluidos. 2 horas.",
    pointsCost: 450,
    monetaryValue: 180,
    category: "tour",
    business: "Rutas del Mineral",
    businessIcon: "🌙",
    stock: 60,
  },
  {
    id: "tour-004",
    title: "Recorrido en tranvía turístico",
    description: "Paseo en tranvía por todo Real del Monte con paradas en miradores. Audioguía incluida. 1.5 horas.",
    pointsCost: 350,
    monetaryValue: 140,
    category: "tour",
    business: "Tranvía de RDM",
    businessIcon: "🚋",
    stock: 80,
  },
];

export const rewardCategories = [
  { id: "gastronomia", label: "Gastronomía", icon: "🍽️" },
  { id: "artesania", label: "Artesanía y Joyería", icon: "💍" },
  { id: "experiencia", label: "Experiencias", icon: "🌟" },
  { id: "hospedaje", label: "Hospedaje", icon: "🏨" },
  { id: "tour", label: "Recorridos", icon: "🚶" },
] as const;
