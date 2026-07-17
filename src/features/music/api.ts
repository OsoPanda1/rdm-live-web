/**
 * RDM Ecos Música — API Client
 * REST client with mock fallback for development.
 */

import type {
  MusicTrack,
  MusicAlbum,
  MusicArtist,
  MusicCronica,
  MusicEvent,
  MusicDonation,
  MusicUserProfile,
  NowPlaying,
} from './types';
import type { PostGameEventResponse } from '../gamification/types';
import { musicActionToGameEvent } from './engine';
import { processGameEvent } from '../gamification/engine';

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

// ============================================================================
// MOCK DATA
// ============================================================================

export const MOCK_ARTISTS: MusicArtist[] = [
  {
    id: 'art-001', name: 'Comunidad Minera', slug: 'comunidad-minera',
    bio: 'Coro comunitario de Real del Monte, guardián de las tradiciones mineras y cornish.',
    origin: 'Real del Monte, Hidalgo', era: 'minero', avatar_url: '/images/10.webp',
    status: 'active', metadata: {}, created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'art-002', name: 'Tamborileros de RDM', slug: 'tamborileros-rdm',
    bio: 'Grupo de tamborileros que mantienen viva la música tradicional de procesión.',
    origin: 'Real del Monte, Hidalgo', era: 'colonial', avatar_url: '/images/11.webp',
    status: 'active', metadata: {}, created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'art-003', name: 'Ecos del Pasado', slug: 'ecos-del-pasado',
    bio: 'Colectivo de archival sonoro que preserva grabaciones históricas del siglo XIX.',
    origin: 'Real del Monte, Hidalgo', era: 'colonial', avatar_url: '/images/12.webp',
    status: 'active', metadata: {}, created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'art-004', name: 'Archivos Sonoros RDM', slug: 'archivos-sonoros-rdm',
    bio: 'Archivo oficial de sonidos del territorio: campanas, viento, lluvia en minas.',
    origin: 'Real del Monte, Hidalgo', era: 'modern', avatar_url: '/images/13.webp',
    status: 'active', metadata: {}, created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'art-005', name: 'Pasteleros Music Group', slug: 'pasteleros-music',
    bio: 'Fusión de gastronomía y música: los pastes cantan.',
    origin: 'Real del Monte, Hidalgo', era: 'contemporary', avatar_url: '/images/14.webp',
    status: 'active', metadata: {}, created_at: '2025-01-01T00:00:00Z',
  },
  {
    id: 'art-006', name: 'Cornish Heritage', slug: 'cornish-heritage',
    bio: 'Música cornish tradicional adaptada para el contexto mexicano.',
    origin: 'Real del Monte, Hidalgo', era: 'cornish', avatar_url: '/images/15.webp',
    status: 'active', metadata: {}, created_at: '2025-01-01T00:00:00Z',
  },
];

export const MOCK_TRACKS: (MusicTrack & { artist?: MusicArtist })[] = [
  {
    id: 'trk-001', album_id: 'alb-001', artist_id: 'art-001',
    title: 'Himno de las Minas', slug: 'himno-de-las-minas',
    file_flac: null, file_wav: null, file_alac: null, file_mp3_320: null, file_mp3_128: null,
    duration_ms: 240000, track_number: 1, canonical_level: 'historical',
    curator_notes: 'Grabación original de 1923 en la Mina La Dificultad.',
    curated_by: 'Archivo Histórico de Hidalgo', location_name: 'Mina La Dificultad',
    location_lat: 20.2145, location_lng: -98.4567,
    spatial_profiles: {
      archivo: { reverb: 0.1 },
      espacio: { reverb: 0.6, panorama: true, effects: ['mine_echo'] },
      metaverso: { reverb: 0.8, panorama: true, hrtf: true, effects: ['mine_echo', 'echo', 'rain'] },
    },
    era: 'minero', play_count: 1247, lyrics: null,
    credits: { recording: 'Archivo Hidalgo', restoration: 'RDM Digital' },
    status: 'active', metadata: { genre: 'folklore' }, created_at: '2025-01-01T00:00:00Z',
    artist: MOCK_ARTISTS[0],
  },
  {
    id: 'trk-002', album_id: 'alb-001', artist_id: 'art-001',
    title: 'Canto al Minero', slug: 'canto-al-minero',
    file_flac: null, file_wav: null, file_alac: null, file_mp3_320: null, file_mp3_128: null,
    duration_ms: 195000, track_number: 2, canonical_level: 'historical',
    curator_notes: 'Canción popular de los mineros cornish, aprendida de memoria.',
    curated_by: 'Comunidad Minera', location_name: 'Real del Monte Centro',
    location_lat: 20.2148, location_lng: -98.4552,
    spatial_profiles: {
      archivo: { reverb: 0.1 },
      espacio: { reverb: 0.5, panorama: true, effects: ['ambient_crowd'] },
      metaverso: { reverb: 0.7, panorama: true, hrtf: true, effects: ['ambient_crowd', 'echo'] },
    },
    era: 'minero', play_count: 892, lyrics: null,
    credits: {}, status: 'active', metadata: { genre: 'folklore' }, created_at: '2025-01-01T00:00:00Z',
    artist: MOCK_ARTISTS[0],
  },
  {
    id: 'trk-003', album_id: 'alb-002', artist_id: 'art-002',
    title: 'Procesión de los Cornish', slug: 'procesion-de-los-cornish',
    file_flac: null, file_wav: null, file_alac: null, file_mp3_320: null, file_mp3_128: null,
    duration_ms: 300000, track_number: 1, canonical_level: 'historical',
    curator_notes: 'Tamborileros en la procesión del Viernes Santo, grabado en 1968.',
    curated_by: 'Archivo Parroquia de San Francisco', location_name: 'Parroquia de San Francisco',
    location_lat: 20.2146, location_lng: -98.4560,
    spatial_profiles: {
      archivo: { reverb: 0.1 },
      espacio: { reverb: 0.8, panorama: true, effects: ['church_bells', 'procession'] },
      metaverso: { reverb: 0.9, panorama: true, hrtf: true, effects: ['church_bells', 'procession', 'rain'] },
    },
    era: 'colonial', play_count: 2103, lyrics: null,
    credits: {}, status: 'active', metadata: { genre: 'procesión' }, created_at: '2025-01-01T00:00:00Z',
    artist: MOCK_ARTISTS[1],
  },
  {
    id: 'trk-004', album_id: 'alb-003', artist_id: 'art-003',
    title: 'Sonido de la Mina (1920)', slug: 'sonido-de-la-mina-1920',
    file_flac: null, file_wav: null, file_alac: null, file_mp3_320: null, file_mp3_128: null,
    duration_ms: 180000, track_number: 1, canonical_level: 'historical',
    curator_notes: 'Grabación de campo del sonido mecánico de los bombos de la mina.',
    curated_by: 'Instituto Nacional de Antropología', location_name: 'Mina Acosta',
    location_lat: 20.2130, location_lng: -98.4580,
    spatial_profiles: {
      archivo: { reverb: 0.1 },
      espacio: { reverb: 0.7, effects: ['mine_echo'] },
      metaverso: { reverb: 0.85, panorama: true, hrtf: true, effects: ['mine_echo', 'dripping'] },
    },
    era: 'colonial', play_count: 567, lyrics: null,
    credits: {}, status: 'active', metadata: { genre: 'field_recording' }, created_at: '2025-01-01T00:00:00Z',
    artist: MOCK_ARTISTS[2],
  },
  {
    id: 'trk-005', album_id: 'alb-004', artist_id: 'art-004',
    title: 'Viento en el Cerro', slug: 'viento-en-el-cerro',
    file_flac: null, file_wav: null, file_alac: null, file_mp3_320: null, file_mp3_128: null,
    duration_ms: 150000, track_number: 1, canonical_level: 'artistic',
    curator_notes: 'Grabación ambiental del viento en el Cerro de San Miguel.',
    curated_by: 'Archivos Sonoros RDM', location_name: 'Cerro de San Miguel',
    location_lat: 20.2160, location_lng: -98.4540,
    spatial_profiles: {
      archivo: { reverb: 0.1 },
      espacio: { reverb: 0.4, effects: ['wind'] },
      metaverso: { reverb: 0.6, panorama: true, hrtf: true, effects: ['wind', 'mountain_echo'] },
    },
    era: 'modern', play_count: 345, lyrics: null,
    credits: {}, status: 'active', metadata: { genre: 'ambiental' }, created_at: '2025-01-01T00:00:00Z',
    artist: MOCK_ARTISTS[3],
  },
  {
    id: 'trk-006', album_id: 'alb-005', artist_id: 'art-005',
    title: 'El Pastel y la Minerva', slug: 'el-pastel-y-la-minerva',
    file_flac: null, file_wav: null, file_alac: null, file_mp3_320: null, file_mp3_128: null,
    duration_ms: 210000, track_number: 1, canonical_level: 'community',
    curator_notes: 'Fusión de ritmo popular y tradición pastelera.',
    curated_by: 'Pasteleros Music Group', location_name: 'Mercado de Pastes',
    location_lat: 20.2147, location_lng: -98.4555,
    spatial_profiles: {
      archivo: { reverb: 0.1 },
      espacio: { reverb: 0.3, effects: ['ambient_crowd'] },
      metaverso: { reverb: 0.5, effects: ['festive', 'ambient_crowd'] },
    },
    era: 'contemporary', play_count: 678, lyrics: null,
    credits: {}, status: 'active', metadata: { genre: 'fusión' }, created_at: '2025-01-01T00:00:00Z',
    artist: MOCK_ARTISTS[4],
  },
  {
    id: 'trk-007', album_id: 'alb-006', artist_id: 'art-006',
    title: 'Cornish Lullaby (Versión RDM)', slug: 'cornish-lullaby-rdm',
    file_flac: null, file_wav: null, file_alac: null, file_mp3_320: null, file_mp3_128: null,
    duration_ms: 180000, track_number: 1, canonical_level: 'artistic',
    curator_notes: 'Nana cornish reinterpretada con instrumentos mexicanos.',
    curated_by: 'Cornish Heritage', location_name: 'Barrio de Spanish Town',
    location_lat: 20.2140, location_lng: -98.4570,
    spatial_profiles: {
      archivo: { reverb: 0.1 },
      espacio: { reverb: 0.5, effects: ['rain'] },
      metaverso: { reverb: 0.7, panorama: true, hrtf: true, effects: ['rain', 'echo'] },
    },
    era: 'cornish', play_count: 432, lyrics: null,
    credits: {}, status: 'active', metadata: { genre: 'nana' }, created_at: '2025-01-01T00:00:00Z',
    artist: MOCK_ARTISTS[5],
  },
  {
    id: 'trk-008', album_id: 'alb-001', artist_id: 'art-001',
    title: 'Noche de Galería', slug: 'noche-de-galeria',
    file_flac: null, file_wav: null, file_alac: null, file_mp3_320: null, file_mp3_128: null,
    duration_ms: 270000, track_number: 3, canonical_level: 'artistic',
    curator_notes: 'Canción creada durante una noche de galería comunitaria.',
    curated_by: 'Comunidad Minera', location_name: 'Galería RDM',
    location_lat: 20.2149, location_lng: -98.4548,
    spatial_profiles: {
      archivo: { reverb: 0.1 },
      espacio: { reverb: 0.4, effects: ['ambient_crowd'] },
      metaverso: { reverb: 0.6, panorama: true, effects: ['ambient_crowd', 'chorus'] },
    },
    era: 'contemporary', play_count: 234, lyrics: null,
    credits: {}, status: 'active', metadata: { genre: 'art' }, created_at: '2025-01-01T00:00:00Z',
    artist: MOCK_ARTISTS[0],
  },
];

export const MOCK_CRONICAS: (MusicCronica & { trackCount?: number })[] = [
  {
    id: 'cron-001', creator_id: null, title: 'Ruta de las Minas',
    slug: 'ruta-de-las-minas', description: 'Recorrido sonoro por las minas históricas de RDM.',
    cover_url: '/images/10.webp', cronica_type: 'ruta', route_id: null,
    canonical_level: 'historical', play_count: 456, like_count: 89, fork_count: 12,
    total_duration_ms: 900000, status: 'active', metadata: {}, created_at: '2025-01-01T00:00:00Z',
    trackCount: 4,
  },
  {
    id: 'cron-002', creator_id: null, title: 'Memoria del Cornish',
    slug: 'memoria-del-cornish', description: 'La historia de los mineros cornish contada a través de la música.',
    cover_url: '/images/11.webp', cronica_type: 'memoria', route_id: null,
    canonical_level: 'historical', play_count: 321, like_count: 67, fork_count: 8,
    total_duration_ms: 720000, status: 'active', metadata: {}, created_at: '2025-01-01T00:00:00Z',
    trackCount: 3,
  },
  {
    id: 'cron-003', creator_id: null, title: 'Ambiental: Cerro y Valle',
    slug: 'ambiental-cerro-y-valle', description: 'Paisaje sonoro del Cerro de San Miguel y el Valle de Pachuca.',
    cover_url: '/images/12.webp', cronica_type: 'ambiental', route_id: null,
    canonical_level: 'artistic', play_count: 198, like_count: 45, fork_count: 15,
    total_duration_ms: 600000, status: 'active', metadata: {}, created_at: '2025-01-01T00:00:00Z',
    trackCount: 3,
  },
];

export const MOCK_EVENTS: MusicEvent[] = [
  {
    id: 'evt-m-001', event_code: 'noche-de-archivo',
    title: 'Noche de Archivo Sonoro', description: 'Escucha collectiva de grabaciones históricas con narración en vivo.',
    event_type: 'archive_session', starts_at: '2025-07-15T20:00:00Z', ends_at: '2025-07-15T23:00:00Z',
    max_participants: 50, current_participants: 23,
    location_name: 'Centro Cultural RDM', is_virtual: false, stream_url: null,
    reward_json: { xp: 150, badge_code: 'oyente_archivo' },
    status: 'upcoming', metadata: {},
  },
  {
    id: 'evt-m-002', event_code: 'listening-party',
    title: 'Listening Party: Himno de las Minas', description: 'Escucha inmersiva con audio espacial del Himno restaurado.',
    event_type: 'listening_party', starts_at: '2025-07-20T19:00:00Z', ends_at: '2025-07-20T21:00:00Z',
    max_participants: 30, current_participants: 18,
    location_name: 'Virtual (XR)', is_virtual: true, stream_url: 'https://stream.rdm.mx/party-001',
    reward_json: { xp: 100 },
    status: 'upcoming', metadata: {},
  },
  {
    id: 'evt-m-003', event_code: 'concierto-pasteleros',
    title: 'Concierto: Pasteleros Music Group', description: 'Fusión de gastronomía y música en el mercado de pastes.',
    event_type: 'concert', starts_at: '2025-08-01T18:00:00Z', ends_at: '2025-08-01T21:00:00Z',
    max_participants: 100, current_participants: 67,
    location_name: 'Mercado de Pastes', is_virtual: false, stream_url: null,
    reward_json: { xp: 200, badge_code: 'mecenas_activo' },
    status: 'upcoming', metadata: {},
  },
];

// ============================================================================
// API FUNCTIONS
// ============================================================================

export async function getTracks(): Promise<MusicTrack[]> {
  try {
    const res = await fetch(`${API_BASE}/music/tracks`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return MOCK_TRACKS;
  }
}

export async function getArtists(): Promise<MusicArtist[]> {
  try {
    const res = await fetch(`${API_BASE}/music/artists`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return MOCK_ARTISTS;
  }
}

export async function getCronicas(): Promise<MusicCronica[]> {
  try {
    const res = await fetch(`${API_BASE}/music/cronicas`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return MOCK_CRONICAS;
  }
}

export async function getEvents(): Promise<MusicEvent[]> {
  try {
    const res = await fetch(`${API_BASE}/music/events`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return MOCK_EVENTS;
  }
}

export async function postDonation(data: {
  amount_cents: number;
  target_id?: string;
  message?: string;
  anonymous?: boolean;
}): Promise<MusicDonation | null> {
  try {
    const res = await fetch(`${API_BASE}/music/donations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    // Mock donation
    return {
      id: `don-${Date.now()}`,
      user_id: 'user-001',
      donation_type: 'general',
      target_id: data.target_id ?? null,
      amount_cents: data.amount_cents,
      currency: 'MXN',
      payment_status: 'completed',
      mecenas_tier: data.amount_cents >= 100000 ? 'productor' : data.amount_cents >= 50000 ? 'mecenas' : 'oyente',
      message: data.message ?? null,
      anonymous: data.anonymous ?? false,
      created_at: new Date().toISOString(),
    };
  }
}

/**
 * Records a music action and feeds it to the gamification engine.
 */
export async function recordMusicAction(
  action: 'track_play' | 'cronica_complete' | 'donation' | 'event_attend',
  payload: Record<string, unknown>,
): Promise<PostGameEventResponse | null> {
  const gameEvent = musicActionToGameEvent(action, payload);
  if (!gameEvent) return null;

  try {
    const res = await fetch(`${API_BASE}/gamification/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_type: gameEvent.event_type,
        source: 'hub',
        payload: gameEvent.payload,
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    // Fallback: client-side gamification processing
    return null;
  }
}
