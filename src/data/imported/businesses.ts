// @ts-nocheck
export interface Business {
  id: string;
  name: string;
  description: string;
  category: string;
  address: string;
  phone?: string;
  website?: string;
  price_range: string;
  images: string[];
  rating: number;
  federation: string;
}

export const BUSINESSES: Business[] = [
  { id: "1", name: "Pastes Kiko's", description: "Los mejores pastes tradicionales de Real del Monte desde 1940, con receta original de los mineros ingleses.", category: "GASTRONOMIA", address: "Calle Principal 45", phone: "771-123-4567", price_range: "ECONOMICO", images: ["https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600"], rating: 4.8, federation: "Gastronómica" },
  { id: "2", name: "Hotel Real del Monte", description: "Hotel boutique en el corazón del Pueblo Mágico con vistas al valle.", category: "HOSPEDAJE", address: "Av. Hidalgo 23", phone: "771-234-5678", website: "https://hotelrdm.mx", price_range: "MODERADO", images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600"], rating: 4.5, federation: "Hospedaje" },
  { id: "3", name: "Taller de Plata Villaseñor", description: "Artesanía en plata fina con diseños inspirados en la herencia minera.", category: "PLATERIA", address: "Calle de la Plata 12", phone: "771-345-6789", price_range: "CARO", images: ["https://images.unsplash.com/photo-1573408301185-9146fe634ad0?w=600"], rating: 4.9, federation: "Platería y Artesanía" },
  { id: "4", name: "Café El Socavón", description: "Café de especialidad en una antigua mina restaurada con ambiente acogedor.", category: "GASTRONOMIA", address: "Callejón Minero 8", phone: "771-456-7890", price_range: "MODERADO", images: ["https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600"], rating: 4.7, federation: "Gastronómica" },
  { id: "5", name: "Posada del Minero", description: "Hospedaje rústico-elegante con chimenea y desayuno tradicional incluido.", category: "HOSPEDAJE", address: "Calle Real 67", phone: "771-567-8901", price_range: "MODERADO", images: ["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600"], rating: 4.3, federation: "Hospedaje" },
  { id: "6", name: "Bar La Cornish", description: "Pub estilo inglés con cervezas artesanales y música en vivo los fines de semana.", category: "BAR", address: "Plaza Principal 3", price_range: "MODERADO", images: ["https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600"], rating: 4.4, federation: "Comercio y Servicios" },
  { id: "7", name: "Guías Mineros RDM", description: "Recorridos guiados por las minas históricas con expertos locales.", category: "TURISMO", address: "Mina de Acosta s/n", phone: "771-678-9012", price_range: "ECONOMICO", images: ["https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=600"], rating: 4.9, federation: "Guías y Experiencias" },
  { id: "8", name: "Artesanías El Panteón", description: "Souvenirs y artesanías únicas inspiradas en el Panteón Inglés.", category: "ARTESANIA", address: "Junto al Panteón Inglés", price_range: "ECONOMICO", images: ["https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600"], rating: 4.2, federation: "Platería y Artesanía" },
  { id: "9", name: "Restaurante La Mina", description: "Cocina hidalguense contemporánea con ingredientes locales de temporada.", category: "GASTRONOMIA", address: "Calle Morelos 15", phone: "771-789-0123", price_range: "CARO", images: ["https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600"], rating: 4.6, federation: "Gastronómica" },
  { id: "10", name: "Tienda Pueblo Mágico", description: "Todo lo que necesitas del Pueblo Mágico en un solo lugar.", category: "COMERCIO", address: "Av. Principal 89", price_range: "ECONOMICO", images: ["https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600"], rating: 4.1, federation: "Comercio y Servicios" },
];

export const CATEGORY_ICONS: Record<string, string> = {
  GASTRONOMIA: "🍽️", HOSPEDAJE: "🏨", ARTESANIA: "🎨", PLATERIA: "💍",
  BAR: "🍺", COMERCIO: "🏪", SERVICIOS: "🔧", TURISMO: "🗺️", OTROS: "📦",
};

export const PRICE_LABELS: Record<string, string> = {
  ECONOMICO: "$", MODERADO: "$$", CARO: "$$$", LUJO: "$$$$",
};

export const FEDERATIONS = [
  { id: "hospedaje", name: "Hospedaje", icon: "🏨", count: 2 },
  { id: "gastronomica", name: "Gastronómica", icon: "🍽️", count: 3 },
  { id: "plateria", name: "Platería y Artesanía", icon: "💍", count: 2 },
  { id: "comercio", name: "Comercio y Servicios", icon: "🏪", count: 2 },
  { id: "guias", name: "Guías y Experiencias", icon: "🗺️", count: 1 },
  { id: "cultura", name: "Cultura y Memoria", icon: "🏛️", count: 0 },
  { id: "realito", name: "REALITO AI", icon: "🤖", count: 0 },
];
