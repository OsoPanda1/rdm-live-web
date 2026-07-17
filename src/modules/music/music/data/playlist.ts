// @ts-nocheck
// Fallback playlist (mismos slugs que los seeds en Supabase).
// Cuando music_tracks tenga audio_url real, el hook lo prioriza sobre este fallback.
export interface FallbackTrack {
  slug: string;
  title: string;
  artist: string;
  cover_url?: string | null;
  audio_url?: string | null;
  duration_seconds: number;
  moods: string[];
  territories: string[];
  donation_url?: string | null;
}

export const FALLBACK_PLAYLIST: FallbackTrack[] = [
  { slug: "real-del-monte-mi-tesoro", title: "Real del Monte Mi Tesoro", artist: "TAMV ONLINE Records", duration_seconds: 252, moods: ["romantica","territorial"], territories: ["plaza-principal"] },
  { slug: "niebla-de-la-montana", title: "Niebla de la Montaña", artist: "TAMV ONLINE Records", duration_seconds: 218, moods: ["ambiental","niebla"], territories: ["bosque-hiloche"] },
  { slug: "socavon-del-rey", title: "Socavón del Rey", artist: "TAMV ONLINE Records", duration_seconds: 305, moods: ["epica","mineria"], territories: ["mina-acosta"] },
  { slug: "paste-de-domingo", title: "Paste de Domingo", artist: "TAMV ONLINE Records", duration_seconds: 198, moods: ["alegre","gastronomia"], territories: ["mercado"] },
  { slug: "panteon-ingles-vals", title: "Vals del Panteón Inglés", artist: "TAMV ONLINE Records", duration_seconds: 274, moods: ["melancolica","historica"], territories: ["panteon-ingles"] },
];