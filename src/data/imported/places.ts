export interface MapMarkerData {
  id: string;
  name: string;
  description: string;
  lat: number;
  lng: number;
  type: "place" | "business";
  isPremium?: boolean;
  category?: string;
}

export const DEFAULT_MAP_VIEWPORT = {
  lat: 20.1374,
  lng: -98.6732,
  zoom: 15,
};

export const MAP_MARKERS: MapMarkerData[] = [
  { id: "p1", name: "Panteón Inglés", description: "Cementerio histórico de los mineros ingleses del siglo XIX", lat: 20.1412, lng: -98.6698, type: "place" },
  { id: "p2", name: "Mina de Acosta", description: "Mina histórica visitable con recorridos guiados", lat: 20.1358, lng: -98.6745, type: "place" },
  { id: "p3", name: "Museo de Medicina Laboral", description: "Historia de la medicina minera en Real del Monte", lat: 20.1385, lng: -98.6720, type: "place" },
  { id: "p4", name: "Plaza Principal", description: "Corazón del Pueblo Mágico con kiosco y jardines", lat: 20.1374, lng: -98.6732, type: "place", isPremium: true },
  { id: "p5", name: "Iglesia de la Asunción", description: "Templo colonial del siglo XVIII", lat: 20.1380, lng: -98.6725, type: "place" },
  { id: "b1", name: "Pastes Kiko's", description: "Los mejores pastes tradicionales", lat: 20.1370, lng: -98.6740, type: "business" },
  { id: "b2", name: "Hotel Real del Monte", description: "Hotel boutique con vistas al valle", lat: 20.1365, lng: -98.6755, type: "business", isPremium: true },
  { id: "b3", name: "Café El Socavón", description: "Café de especialidad en antigua mina", lat: 20.1390, lng: -98.6710, type: "business" },
  { id: "b4", name: "Taller de Plata Villaseñor", description: "Artesanía en plata fina", lat: 20.1395, lng: -98.6750, type: "business", isPremium: true },
  { id: "b5", name: "Bar La Cornish", description: "Pub estilo inglés", lat: 20.1378, lng: -98.6728, type: "business" },
];

export const ROUTES = [
  { id: "r1", name: "Ruta Minera", description: "Recorre las principales minas históricas de Real del Monte", duration: "3 horas", difficulty: "Moderada", distance: "5.2 km", points: 8 },
  { id: "r2", name: "Ruta del Paste", description: "Descubre la historia gastronómica del famoso paste cornish", duration: "2 horas", difficulty: "Fácil", distance: "2.8 km", points: 6 },
  { id: "r3", name: "Ruta del Panteón Inglés", description: "Historia y leyendas del cementerio británico más famoso de México", duration: "1.5 horas", difficulty: "Fácil", distance: "1.5 km", points: 4 },
  { id: "r4", name: "Ruta de Senderismo Peñas Cargadas", description: "Naturaleza y formaciones rocosas únicas en los bosques de oyamel", duration: "4 horas", difficulty: "Alta", distance: "8 km", points: 5 },
  { id: "r5", name: "Ruta Cultural del Centro", description: "Arquitectura colonial, museos y artesanías en el corazón del pueblo", duration: "2 horas", difficulty: "Fácil", distance: "2 km", points: 10 },
  { id: "r6", name: "Ruta Nocturna de Leyendas", description: "Recorrido nocturno por los lugares más misteriosos y sus historias", duration: "2 horas", difficulty: "Fácil", distance: "1.8 km", points: 7 },
];

export const SHUTTLE_ROUTES = [
  { id: "s1", origin: "Pachuca Centro", destination: "Real del Monte", departure_time: "07:00", return_time: "20:00", price_per_person: 25, capacity: 40, days_of_week: ["lun","mar","mie","jue","vie","sab","dom"], company_name: "Transportes Mineros" },
  { id: "s2", origin: "CDMX Terminal Norte", destination: "Real del Monte", departure_time: "08:30", return_time: "18:00", price_per_person: 180, capacity: 45, days_of_week: ["sab","dom"], company_name: "Pullman de Hidalgo" },
  { id: "s3", origin: "Aeropuerto Pachuca", destination: "Real del Monte", departure_time: "Bajo demanda", price_per_person: 350, capacity: 4, days_of_week: ["lun","mar","mie","jue","vie","sab","dom"], company_name: "Transfer RDM" },
];
