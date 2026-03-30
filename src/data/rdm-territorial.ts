/**
 * CORPUS MAXIMUS RDM DIGITAL — Datos Territoriales Completos
 * Fuente: Expediente IDT RDM-INFRA-TOTAL-001
 */

export interface Estacionamiento {
  id: string;
  nombre: string;
  ubicacion: string;
  lat: number;
  lng: number;
  capacidad: string;
  tipo: "masiva" | "alta" | "media" | "baja";
}

export interface SitioPatrimonial {
  id: string;
  nombre: string;
  categoria: "museo" | "monumento" | "espacio-identidad" | "hito-visual" | "naturaleza";
  descripcion: string;
  lat: number;
  lng: number;
  horario?: string;
  icono: string;
  destacado?: boolean;
}

export interface RutaTematica {
  id: string;
  nombre: string;
  descripcion: string;
  duracion: string;
  dificultad: "Fácil" | "Moderada" | "Avanzada";
  paradas: string[];
  color: string;
}

// ───── I. ESTACIONAMIENTOS (NODO CERO DE MOVILIDAD) ─────

export const ESTACIONAMIENTOS: Estacionamiento[] = [
  { id: "EST-01", nombre: "Explanada de Dolores", ubicacion: "Calle Dolores, Barrio de Dolores", lat: 20.13585, lng: -98.67049, capacidad: "Masiva — Nodo sur de museos", tipo: "masiva" },
  { id: "EST-02", nombre: "Don Fredy", ubicacion: "La Trinidad 147, La Quebradilla", lat: 20.13846, lng: -98.67047, capacidad: "Alta — Acceso rápido al centro", tipo: "alta" },
  { id: "EST-03", nombre: "Estacionamiento Mayor", ubicacion: "Av. Juárez (Entrada Principal)", lat: 20.13780, lng: -98.67550, capacidad: "Masiva — Principal receptáculo", tipo: "masiva" },
  { id: "EST-04", nombre: "Santa Teresa", ubicacion: "Zona de Museos Sur (Mina Acosta)", lat: 20.13450, lng: -98.67010, capacidad: "Media — Privado", tipo: "media" },
  { id: "EST-05", nombre: "Los Portales", ubicacion: "Calle Guerrero, Plaza Principal", lat: 20.14010, lng: -98.67150, capacidad: "Media — Privado comercial", tipo: "media" },
  { id: "EST-06", nombre: "Hotel Paraíso Real", ubicacion: "Av. Hidalgo (Centro Histórico)", lat: 20.14080, lng: -98.67250, capacidad: "Baja — Exclusivo pernocta", tipo: "baja" },
  { id: "EST-07", nombre: "Parque Sensorial", ubicacion: "Carretera a Pachuca (Área Bosque)", lat: 20.14200, lng: -98.68500, capacidad: "Media — Ecoturismo", tipo: "media" },
];

// ───── II. MUSEOS Y SOCAVONES ─────

export const MUSEOS_SITIO: SitioPatrimonial[] = [
  { id: "MUS-01", nombre: "Mina de Acosta", categoria: "museo", descripcion: "Recorrido subterráneo de 400m. Conserva maquinaria de vapor y eléctrica.", lat: 20.13520, lng: -98.66980, horario: "10:00–18:00 (Mar-Dom)", icono: "⛏️", destacado: true },
  { id: "MUS-02", nombre: "Mina La Dificultad", categoria: "museo", descripcion: "Hito de la transición tecnológica minera.", lat: 20.14595, lng: -98.67194, horario: "10:00–18:00 (Mié-Dom)", icono: "🏗️" },
  { id: "MUS-03", nombre: "Museo de Medicina Laboral", categoria: "museo", descripcion: "Único en su tipo: narra la historia del hospital minero.", lat: 20.13650, lng: -98.67120, horario: "10:00–18:00 (Mar-Dom)", icono: "🏥", destacado: true },
  { id: "MUS-04", nombre: "Casa Grande (Archivo Histórico)", categoria: "museo", descripcion: "Memoria documental de la empresa minera.", lat: 20.14070, lng: -98.67280, icono: "📜" },
  { id: "MUS-05", nombre: "Museo del Paste", categoria: "museo", descripcion: "Legado de Cornualles; taller interactivo de cocción.", lat: 20.13950, lng: -98.67050, icono: "🥟", destacado: true },
];

// ───── III. ESPACIOS DE IDENTIDAD Y MEMORIA ─────

export const ESPACIOS_IDENTIDAD: SitioPatrimonial[] = [
  { id: "IDE-01", nombre: "Panteón Inglés (1851)", categoria: "espacio-identidad", descripcion: "Tumbas orientadas a Europa; símbolo del mestizaje cultural.", lat: 20.13827, lng: -98.66704, icono: "🪦", destacado: true },
  { id: "IDE-02", nombre: "Galería Badillo", categoria: "espacio-identidad", descripcion: "Calle Iturbide 6. Repositorio fotográfico privado de la evolución de Real del Monte.", lat: 20.13985, lng: -98.67204, icono: "📸" },
  { id: "IDE-03", nombre: "Monumento a la 1ra Huelga en América", categoria: "monumento", descripcion: "Mural y monumento en la entrada principal; hito del derecho laboral mundial.", lat: 20.13824, lng: -98.67336, icono: "✊", destacado: true },
];

// ───── IV. HITOS VISUALES Y DEPORTIVOS ─────

export const HITOS_VISUALES: SitioPatrimonial[] = [
  { id: "VIS-01", nombre: "Letras Monumentales (Plaza)", categoria: "hito-visual", descripcion: "Frente a la Parroquia del Rosario.", lat: 20.14033, lng: -98.67199, icono: "📍" },
  { id: "VIS-02", nombre: "Letras Monumentales (Dificultad)", categoria: "hito-visual", descripcion: "A 20m de la mina.", lat: 20.14595, lng: -98.67194, icono: "📍" },
  { id: "VIS-03", nombre: "Callejón de las Leyendas del Fútbol", categoria: "hito-visual", descripcion: "Homenaje a la cuna del fútbol mexicano.", lat: 20.14045, lng: -98.67260, icono: "⚽" },
  { id: "VIS-04", nombre: "Callejón de los Artistas", categoria: "hito-visual", descripcion: "Pasaje con murales dedicados a la cinematografía nacional filmada en el territorio.", lat: 20.14040, lng: -98.67240, icono: "🎬" },
];

// ───── V. PATRIMONIO NATURAL ─────

export const PATRIMONIO_NATURAL: SitioPatrimonial[] = [
  { id: "NAT-01", nombre: "Bosque El Hiloche", categoria: "naturaleza", descripcion: "Reserva estatal. Senderismo, ciclismo y miradores.", lat: 20.14250, lng: -98.68000, icono: "🌲", destacado: true },
  { id: "NAT-02", nombre: "Lienzo Charro Municipal", categoria: "naturaleza", descripcion: "En el corazón del Hiloche; cultura del caballo bajo microclima de montaña.", lat: 20.14260, lng: -98.68010, icono: "🐎" },
  { id: "NAT-03", nombre: "Peñas Cargadas", categoria: "naturaleza", descripcion: "Formaciones basálticas para rappel, escalada y fotografía.", lat: 20.12450, lng: -98.64600, icono: "🪨", destacado: true },
  { id: "NAT-04", nombre: "Ruta del Pulque (Tezoantla)", categoria: "naturaleza", descripcion: "Tinacales tradicionales y producción ancestral de aguamiel.", lat: 20.12576, lng: -98.64768, icono: "🍶" },
];

// ───── RUTAS TEMÁTICAS ─────

export const RUTAS_TEMATICAS: RutaTematica[] = [
  {
    id: "RT-01",
    nombre: "Ruta de los Pastes Auténticos",
    descripcion: "Recorre las pastelerías originales de tradición cornish. Degusta pastes artesanales en cada parada.",
    duracion: "2–3 horas",
    dificultad: "Fácil",
    paradas: ["Museo del Paste", "Pastes El Portal", "Pastes Kikos", "Plaza Principal"],
    color: "hsl(24 72% 50%)",
  },
  {
    id: "RT-02",
    nombre: "Camino de la Mina y la Niebla",
    descripcion: "Del centro histórico a la profundidad de la Mina de Acosta, pasando por el Monumento a la Huelga.",
    duracion: "3–4 horas",
    dificultad: "Moderada",
    paradas: ["Monumento a la 1ra Huelga", "Mina de Acosta", "Museo de Medicina Laboral", "Panteón Inglés"],
    color: "hsl(212 36% 45%)",
  },
  {
    id: "RT-03",
    nombre: "Circuito de Miradores",
    descripcion: "Los mejores puntos panorámicos de la sierra con vistas al valle y la neblina.",
    duracion: "4–5 horas",
    dificultad: "Moderada",
    paradas: ["Peñas Cargadas", "Bosque El Hiloche", "Mirador La Cruz"],
    color: "hsl(154 66% 36%)",
  },
  {
    id: "RT-04",
    nombre: "Noches Mágicas en RDM",
    descripcion: "Recorrido nocturno por callejones con leyendas, iluminación y gastronomía de noche.",
    duracion: "2 horas",
    dificultad: "Fácil",
    paradas: ["Callejón de las Leyendas", "Callejón de los Artistas", "Plaza Principal", "Letras Monumentales"],
    color: "hsl(270 40% 50%)",
  },
  {
    id: "RT-05",
    nombre: "Ruta del Pulque y Naturaleza",
    descripcion: "Naturaleza ancestral: tinacales, bosque de oyamel y formaciones geológicas.",
    duracion: "5–6 horas",
    dificultad: "Avanzada",
    paradas: ["Ruta del Pulque (Tezoantla)", "Peñas Cargadas", "Bosque El Hiloche"],
    color: "hsl(145 35% 28%)",
  },
];

// ───── ALL SITES UNIFIED (for map) ─────

export const ALL_TERRITORIAL_SITES = [
  ...MUSEOS_SITIO,
  ...ESPACIOS_IDENTIDAD,
  ...HITOS_VISUALES,
  ...PATRIMONIO_NATURAL,
];

// ───── FICHA TÉCNICA ─────

export const FICHA_TECNICA = {
  capitalIntelectual: "21,000+ Horas de Desarrollo",
  valorComercial: "$150,000–$300,000 USD (MVP Avanzado)",
  seguridad: "Protocolo TENOCHTITLAN (Heptafederado)",
  ia: "Isabella Guardian (Policy Engine Embebido)",
  altitud: "2,700 msnm",
  temperatura: "14°C promedio",
  poblacion: "~13,000 habitantes",
  fundacion: "1560",
  nombreOficial: "Mineral del Monte (Real del Monte)",
  estado: "Hidalgo, México",
  designacion: "Pueblo Mágico (2004)",
};
