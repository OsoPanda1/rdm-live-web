/**
 * RDM Ecos Música — Core Types
 * The sonic nervous system of LTOS
 */

export type SpatialMode = 'archivo' | 'espacio' | 'metaverso';
export type CanonicalLevel = 'historical' | 'artistic' | 'community';
export type AlbumType = 'studio' | 'live' | 'archive' | 'compilation' | 'cronica';
export type ArtistEra = 'colonial' | 'minero' | 'cornish' | 'modern' | 'contemporary';
export type CronicaType = 'ruta' | 'memoria' | 'ambiental' | 'mixed';
export type MecenasTier = 'oyente' | 'mecenas' | 'productor';
export type DonationType = 'track' | 'album' | 'cronica' | 'general' | 'artist' | 'project';
export type MusicEventType = 'listening_party' | 'archive_session' | 'concert' | 'workshop';
export type TrackStatus = 'active' | 'draft' | 'archived' | 'restricted';

export interface MusicArtist {
  id: string;
  name: string;
  slug: string;
  bio: string | null;
  origin: string;
  era: ArtistEra | null;
  avatar_url: string | null;
  status: 'active' | 'archived' | 'featured';
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface MusicAlbum {
  id: string;
  artist_id: string | null;
  title: string;
  slug: string;
  description: string | null;
  cover_url: string | null;
  album_type: AlbumType;
  canonical_level: CanonicalLevel;
  release_year: number | null;
  genres: string[];
  territory_id: string;
  total_tracks: number;
  total_duration_ms: number;
  status: 'active' | 'draft' | 'archived';
  metadata: Record<string, unknown>;
  created_at: string;
  artist?: MusicArtist;
}

export interface SpatialProfile {
  reverb: number;
  panorama?: boolean;
  hrtf?: boolean;
  rain?: boolean;
  effects?: string[];
}

export interface MusicTrack {
  id: string;
  album_id: string | null;
  artist_id: string | null;
  title: string;
  slug: string;
  file_flac: string | null;
  file_wav: string | null;
  file_alac: string | null;
  file_mp3_320: string | null;
  file_mp3_128: string | null;
  duration_ms: number;
  track_number: number;
  canonical_level: CanonicalLevel;
  curator_notes: string | null;
  curated_by: string | null;
  location_name: string | null;
  location_lat: number | null;
  location_lng: number | null;
  spatial_profiles: Record<SpatialMode, SpatialProfile>;
  era: string | null;
  play_count: number;
  lyrics: string | null;
  credits: Record<string, unknown>;
  status: TrackStatus;
  metadata: Record<string, unknown>;
  created_at: string;
  artist?: MusicArtist;
  album?: MusicAlbum;
}

export interface MusicCronica {
  id: string;
  creator_id: string | null;
  title: string;
  slug: string;
  description: string | null;
  cover_url: string | null;
  cronica_type: CronicaType;
  route_id: string | null;
  canonical_level: CanonicalLevel;
  play_count: number;
  like_count: number;
  fork_count: number;
  total_duration_ms: number;
  status: 'active' | 'draft' | 'archived';
  metadata: Record<string, unknown>;
  created_at: string;
  tracks?: CronicaTrack[];
}

export interface CronicaTrack {
  id: string;
  cronica_id: string;
  track_id: string;
  position: number;
  transition_type: 'crossfade' | 'gap' | 'narrative_gap' | 'ambient';
  transition_ms: number;
  narration_text: string | null;
  track?: MusicTrack;
}

export interface MusicListeningSession {
  id: string;
  user_id: string | null;
  session_type: 'solo' | 'collective' | 'event';
  track_id: string | null;
  cronica_id: string | null;
  spatial_mode: SpatialMode;
  started_at: string;
  ended_at: string | null;
  duration_ms: number;
  completion_pct: number;
  territory_id: string;
}

export interface MusicDonation {
  id: string;
  user_id: string;
  donation_type: DonationType;
  target_id: string | null;
  amount_cents: number;
  currency: string;
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  mecenas_tier: MecenasTier | null;
  message: string | null;
  anonymous: boolean;
  created_at: string;
}

export interface MusicEvent {
  id: string;
  event_code: string;
  title: string;
  description: string;
  event_type: MusicEventType;
  starts_at: string;
  ends_at: string | null;
  max_participants: number;
  current_participants: number;
  location_name: string | null;
  is_virtual: boolean;
  stream_url: string | null;
  reward_json: { xp?: number; badge_code?: string };
  status: 'upcoming' | 'live' | 'completed' | 'cancelled';
  metadata: Record<string, unknown>;
}

export interface MusicUserProfile {
  id: string;
  user_id: string;
  favorite_track_ids: string[];
  favorite_artist_ids: string[];
  cronicas_created: number;
  total_listened_ms: number;
  total_tracks_played: number;
  total_donated_cents: number;
  mecenas_tier: MecenasTier;
  sound_persona: {
    primary_era?: string;
    primary_genre?: string;
    exploration_score?: number;
    top_locations?: string[];
  };
  music_badges: string[];
}

export interface NowPlaying {
  track: MusicTrack;
  cronica?: MusicCronica;
  spatial_mode: SpatialMode;
  progress_ms: number;
  is_playing: boolean;
  volume: number;
  queue: MusicTrack[];
  queue_index: number;
}
