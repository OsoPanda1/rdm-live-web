// @ts-nocheck
export type Track = {
  id: number
  slug: string
  title: string
  artist: string
  cover: string | null
  audio: string
  donationUrl: string | null
  mood: string[]
  territory: string[]
  durationSeconds: number
}

export const PLAYLIST: Track[] = [
  { id: 1, slug: "real-del-monte-mi-tesoro", title: "Real del Monte · Mi Tesoro", artist: "TAMV ONLINE Records", cover: null, audio: "/music/tesoro.mp3", donationUrl: null, mood: ["romantica", "territorial"], territory: ["plaza-principal"], durationSeconds: 252 },
  { id: 2, slug: "niebla-de-la-montana", title: "Niebla de la Montaña", artist: "TAMV ONLINE Records", cover: null, audio: "/music/niebla.mp3", donationUrl: null, mood: ["ambiental"], territory: ["bosque-hiloche"], durationSeconds: 218 },
  { id: 3, slug: "subsuelo-cornish", title: "Subsuelo Cornish", artist: "TAMV ONLINE Records", cover: null, audio: "/music/cornish.mp3", donationUrl: null, mood: ["minero", "industrial"], territory: ["mina-acosta"], durationSeconds: 305 },
  { id: 4, slug: "panteon-ingles", title: "Panteón Inglés (Réquiem)", artist: "TAMV ONLINE Records", cover: null, audio: "/music/panteon.mp3", donationUrl: null, mood: ["memoria", "silenciosa"], territory: ["panteon-ingles"], durationSeconds: 281 },
]