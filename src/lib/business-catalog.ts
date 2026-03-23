export interface BusinessCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface CommercialBusiness {
  id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  status: "active" | "coming_soon";
}

export const BUSINESS_CAPACITY_TARGET = 250;

export const RDM_BUSINESS_CATEGORIES: BusinessCategory[] = [
  { id: "gastronomia", name: "Gastronomía", description: "Cocina local, cafeterías y panadería artesanal.", icon: "🍽️" },
  { id: "artesanias", name: "Artesanías", description: "Textiles, piezas decorativas y arte popular.", icon: "🧵" },
  { id: "platerias", name: "Platerías", description: "Joyería de plata y talleres especializados.", icon: "💍" },
  { id: "tiendas-miscelaneas", name: "Tiendas & Misceláneas", description: "Comercio de conveniencia y variedad diaria.", icon: "🛍️" },
  { id: "servicios-turisticos", name: "Servicios Turísticos", description: "Recorridos, guías, racers, cuatrimotos y camioncitos turísticos.", icon: "🧭" },
  { id: "bares", name: "Bares", description: "Mixología, música y ambiente nocturno.", icon: "🍸" },
  { id: "hospedaje", name: "Hospedaje", description: "Hoteles, cabañas y cuartos disponibles.", icon: "🛏️" },
  { id: "otros", name: "Otros Comercios", description: "Ropa, verdura, aseo del hogar, zapaterías, papelerías y salones.", icon: "🏪" },
  { id: "emergencias", name: "Emergencias", description: "Cerrajeros, dentales, médicos, mecánicos y talacheras.", icon: "🚨" },
  { id: "nuevas-secciones", name: "Nuevas Secciones", description: "Espacio para categorías futuras no contempladas aún.", icon: "➕" },
];

export const MAP_INTEGRATION_PHASES = [
  "Fase 1: normalización de categorías y campos para 250 negocios.",
  "Fase 2: filtros dinámicos por categoría, estado y cobertura territorial.",
  "Fase 3: analítica de demanda y densidad comercial por cuadrante.",
  "Fase 4: conexión con onboarding digital para altas en tiempo real.",
];

export const INITIAL_COMMERCIAL_BUSINESSES: CommercialBusiness[] = [
  { id: "biz-001", name: "Pastes Mina Real", category: "gastronomia", lat: 20.137, lng: -98.670, status: "active" },
  { id: "biz-002", name: "Plata Monte Alto", category: "platerias", lat: 20.139, lng: -98.672, status: "active" },
  { id: "biz-003", name: "Ruta Cuatrimoto Eclipse", category: "servicios-turisticos", lat: 20.141, lng: -98.675, status: "coming_soon" },
  { id: "biz-004", name: "Casa Cabaña del Bosque", category: "hospedaje", lat: 20.136, lng: -98.667, status: "active" },
  { id: "biz-005", name: "Talachera Hidalgo Express", category: "emergencias", lat: 20.134, lng: -98.673, status: "coming_soon" },
  { id: "biz-006", name: "Mercería La Montaña", category: "artesanias", lat: 20.132, lng: -98.669, status: "active" },
];
