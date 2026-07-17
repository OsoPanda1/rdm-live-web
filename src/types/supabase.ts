export interface Business {
  id: string;
  name: string;
  description: string | null;
  category: string;
  direccion: string | null;
  telefono: string | null;
  horario: string | null;
  image_url: string | null;
  rating: number | null;
  lat: number | null;
  lng: number | null;
  verified: boolean;
  created_at: string;
}

export interface TourPackage {
  id: string;
  name: string;
  description: string | null;
  type: string;
  duration: string;
  price: number;
  image_url: string | null;
  includes: string[];
  available: boolean;
  created_at: string;
}

export interface ShuttleRoute {
  id: string;
  name: string;
  origin: string;
  destination: string;
  departure_time: string;
  return_time: string;
  price: number;
  duration: string;
  shuttle_companies?: { name: string } | null;
  available: boolean;
  created_at: string;
}

export interface TransportProvider {
  id: string;
  name: string;
  type: string;
  description: string | null;
  phone: string | null;
  schedule: string | null;
  image_url: string | null;
  verified: boolean;
  created_at: string;
}

export interface EventRDM {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image: string;
  category: string;
  price: string;
  featured: boolean;
}

export interface FeedbackEntry {
  id?: string;
  decision_trace_id: string;
  rating: number;
  feedback: string | null;
  consentimiento: boolean | null;
  created_at: string;
}