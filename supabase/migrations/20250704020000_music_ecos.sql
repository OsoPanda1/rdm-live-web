-- ============================================================================
-- RDM Ecos Música — Database Schema
-- The sonic nervous system of LTOS
--
-- Sovereign curation, FLAC lossless, 3D visuals, community economy.
-- All listening events flow through the gamification event bus.
-- ============================================================================

-- ============================================================================
-- 1. ARTISTS (Local & historical)
-- ============================================================================

CREATE TABLE IF NOT EXISTS music_artists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  bio TEXT,
  origin TEXT DEFAULT 'Real del Monte',
  era TEXT CHECK (era IN ('colonial', 'minero', 'cornish', 'modern', 'contemporary')),
  avatar_url TEXT,
  social_links JSONB DEFAULT '{}',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'featured')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. ALBUMS (Collections with narrative)
-- ============================================================================

CREATE TABLE IF NOT EXISTS music_albums (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID REFERENCES music_artists(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  cover_url TEXT,
  -- Album type: studio, live, archive, compilation, cronica
  album_type TEXT NOT NULL DEFAULT 'studio' CHECK (album_type IN ('studio', 'live', 'archive', 'compilation', 'cronica')),
  -- Canonical level: historical, artistic, community
  canonical_level TEXT DEFAULT 'community' CHECK (canonical_level IN ('historical', 'artistic', 'community')),
  -- Year of recording
  release_year INTEGER,
  -- Genre tags
  genres TEXT[] DEFAULT '{}',
  -- Territory context
  territory_id TEXT DEFAULT 'rdm',
  -- Metadata
  total_tracks INTEGER DEFAULT 0,
  total_duration_ms BIGINT DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 3. TRACKS (Individual audio pieces)
-- ============================================================================

CREATE TABLE IF NOT EXISTS music_tracks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  album_id UUID REFERENCES music_albums(id) ON DELETE SET NULL,
  artist_id UUID REFERENCES music_artists(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  -- Audio files (lossless master + transcoded versions)
  file_flac TEXT, -- /storage/tracks/{id}/master.flac
  file_wav TEXT,
  file_alac TEXT,
  file_mp3_320 TEXT,
  file_mp3_128 TEXT,
  -- Duration
  duration_ms INTEGER NOT NULL DEFAULT 0,
  -- Track number in album
  track_number INTEGER DEFAULT 1,
  -- Canonical level
  canonical_level TEXT DEFAULT 'community' CHECK (canonical_level IN ('historical', 'artistic', 'community')),
  -- Curator info
  curator_notes TEXT,
  curated_by TEXT,
  -- Location context (where this was recorded or is associated)
  location_name TEXT,
  location_lat NUMERIC,
  location_lng NUMERIC,
  -- Spatial audio profiles
  spatial_profiles JSONB DEFAULT '{}',
  -- { "archivo": { "reverb": 0.1 }, "espacio": { "reverb": 0.6, "panorama": true }, "metaverso": { "reverb": 0.8, "effects": ["chorus"] } }
  -- Era/period
  era TEXT,
  -- Play count
  play_count INTEGER DEFAULT 0,
  -- Lyrics/credits
  lyrics TEXT,
  credits JSONB DEFAULT '{}',
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived', 'restricted')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_music_tracks_album ON music_tracks(album_id);
CREATE INDEX IF NOT EXISTS idx_music_tracks_artist ON music_tracks(artist_id);
CREATE INDEX IF NOT EXISTS idx_music_tracks_canonical ON music_tracks(canonical_level);

-- ============================================================================
-- 4. CRONICAS SONORAS (Narrative playlists)
-- ============================================================================

CREATE TABLE IF NOT EXISTS music_cronicas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  cover_url TEXT,
  -- Cronica type: ruta, memoria, ambiental, mixed
  cronica_type TEXT NOT NULL DEFAULT 'mixed' CHECK (cronica_type IN ('ruta', 'memoria', 'ambiental', 'mixed')),
  -- Linked routes/locations
  route_id TEXT, -- references rutas_tematicas
  locations JSONB DEFAULT '[]',
  -- [{ "name": "Plaza Principal", "lat": 20.1, "lng": -98.7, "track_ids": [...] }]
  -- Canonical
  canonical_level TEXT DEFAULT 'community' CHECK (canonical_level IN ('historical', 'artistic', 'community')),
  -- Stats
  play_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  fork_count INTEGER DEFAULT 0, -- times others forked this cronica
  -- Duration
  total_duration_ms BIGINT DEFAULT 0,
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'draft', 'archived')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 5. CRONICA TRACKS (Ordered tracks in a cronica)
-- ============================================================================

CREATE TABLE IF NOT EXISTS music_cronica_tracks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cronica_id UUID NOT NULL REFERENCES music_cronicas(id) ON DELETE CASCADE,
  track_id UUID NOT NULL REFERENCES music_tracks(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  -- Transition between tracks
  transition_type TEXT DEFAULT 'crossfade' CHECK (transition_type IN ('crossfade', 'gap', 'narrative_gap', 'ambient')),
  transition_ms INTEGER DEFAULT 3000,
  -- Narration between tracks
  narration_text TEXT,
  narration_voice TEXT,
  -- Location trigger
  location_trigger JSONB, -- { "lat": 20.1, "lng": -98.7, "radius_m": 50 }
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cronica_id, track_id)
);

CREATE INDEX IF NOT EXISTS idx_cronica_tracks_cronica ON music_cronica_tracks(cronica_id);

-- ============================================================================
-- 6. LISTENING SESSIONS (Real-time listening events)
-- ============================================================================

CREATE TABLE IF NOT EXISTS music_listening_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  -- Session type: solo, collective, event
  session_type TEXT NOT NULL DEFAULT 'solo' CHECK (session_type IN ('solo', 'collective', 'event')),
  -- What was listened to
  track_id UUID REFERENCES music_tracks(id) ON DELETE SET NULL,
  cronica_id UUID REFERENCES music_cronicas(id) ON DELETE SET NULL,
  -- Spatial mode
  spatial_mode TEXT DEFAULT 'archivo' CHECK (spatial_mode IN ('archivo', 'espacio', 'metaverso')),
  -- Listening data
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_ms INTEGER DEFAULT 0,
  -- Completion percentage
  completion_pct NUMERIC(5,2) DEFAULT 0,
  -- Gamification event ID
  gamification_event_id UUID,
  -- Territory context
  territory_id TEXT DEFAULT 'rdm',
  metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_listening_sessions_user ON music_listening_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_listening_sessions_track ON music_listening_sessions(track_id);

-- ============================================================================
-- 7. DONATIONS (Mecenas system)
-- ============================================================================

CREATE TABLE IF NOT EXISTS music_donations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Recipient: track, album, cronica, or general fund
  donation_type TEXT NOT NULL CHECK (donation_type IN ('track', 'album', 'cronica', 'general', 'artist', 'project')),
  target_id UUID, -- track_id, album_id, cronica_id, artist_id
  -- Amount
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'MXN',
  -- Stripe/payment
  stripe_payment_id TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')),
  -- Mecenas tier
  mecenas_tier TEXT CHECK (mecenas_tier IN ('oyente', 'mecenas', 'productor')),
  -- Message (optional)
  message TEXT,
  -- Anonymous
  anonymous BOOLEAN DEFAULT false,
  -- Gamification event ID
  gamification_event_id UUID,
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_music_donations_user ON music_donations(user_id);
CREATE INDEX IF NOT EXISTS idx_music_donations_target ON music_donations(donation_type, target_id);

-- ============================================================================
-- 8. MUSIC EVENTS (Listening parties, concerts, archive sessions)
-- ============================================================================

CREATE TABLE IF NOT EXISTS music_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  -- Event type: listening_party, archive_session, concert, workshop
  event_type TEXT NOT NULL CHECK (event_type IN ('listening_party', 'archive_session', 'concert', 'workshop')),
  -- Linked content
  cronica_id UUID REFERENCES music_cronicas(id) ON DELETE SET NULL,
  track_ids UUID[] DEFAULT '{}',
  -- Schedule
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  -- Participation
  max_participants INTEGER DEFAULT 0,
  current_participants INTEGER DEFAULT 0,
  -- Location
  location_name TEXT,
  location_lat NUMERIC,
  location_lng NUMERIC,
  is_virtual BOOLEAN DEFAULT true,
  stream_url TEXT,
  -- Gamification rewards for attending
  reward_json JSONB DEFAULT '{}',
  -- Status
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'completed', 'cancelled')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 9. USER MUSIC PROFILE (Sound persona)
-- ============================================================================

CREATE TABLE IF NOT EXISTS music_user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  -- Favorites
  favorite_track_ids UUID[] DEFAULT '{}',
  favorite_artist_ids UUID[] DEFAULT '{}',
  -- Cronica creator stats
  cronicas_created INTEGER DEFAULT 0,
  -- Listening stats
  total_listened_ms BIGINT DEFAULT 0,
  total_tracks_played INTEGER DEFAULT 0,
  -- Mecenas status
  total_donated_cents INTEGER DEFAULT 0,
  mecenas_tier TEXT DEFAULT 'oyente' CHECK (mecenas_tier IN ('oyente', 'mecenas', 'productor')),
  -- Sound persona (computed from listening habits)
  sound_persona JSONB DEFAULT '{}',
  -- { "primary_era": "minero", "primary_genre": "tradicional", "exploration_score": 0.7 }
  -- Badges
  music_badges TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 10. VOTES (Community curation input)
-- ============================================================================

CREATE TABLE IF NOT EXISTS music_votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('track', 'album', 'cronica', 'project')),
  target_id UUID NOT NULL,
  vote_value INTEGER NOT NULL CHECK (vote_value IN (-1, 1)),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, vote_type, target_id)
);

-- ============================================================================
-- 11. RLS POLICIES
-- ============================================================================

-- Artists: public read
ALTER TABLE music_artists ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Artists public read" ON music_artists FOR SELECT USING (true);

-- Albums: public read
ALTER TABLE music_albums ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Albums public read" ON music_albums FOR SELECT USING (true);

-- Tracks: public read (audio files may be restricted by status)
ALTER TABLE music_tracks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tracks public read" ON music_tracks FOR SELECT USING (status = 'active');

-- Cronicas: public read
ALTER TABLE music_cronicas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Cronicas public read" ON music_cronicas FOR SELECT USING (status = 'active');

-- Listening sessions: own data only
ALTER TABLE music_listening_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Listening sessions own" ON music_listening_sessions
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Listening sessions insert own" ON music_listening_sessions
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Donations: own data only
ALTER TABLE music_donations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Donations own" ON music_donations
  FOR SELECT USING (user_id = auth.uid());

-- Music events: public read
ALTER TABLE music_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Music events public" ON music_events FOR SELECT USING (true);

-- User music profile: own data, public read for personas
ALTER TABLE music_user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Music profile own" ON music_user_profiles
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Music profile upsert own" ON music_user_profiles
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Music profile update own" ON music_user_profiles
  FOR UPDATE USING (user_id = auth.uid());

-- ============================================================================
-- 12. SEED DATA — Artists & Albums
-- ============================================================================

INSERT INTO music_artists (name, slug, bio, era, status) VALUES
  ('Comunidad Minera de RDM', 'comunidad-minera', 'Coro y agrupaciones de la comunidad minera de Real del Monte, preservando la tradición musical cornish-mexicana.', 'minero', 'featured'),
  ('Tamborileros de la Sierra', 'tamborileros-sierra', 'Grupo de música tradicional que mantiene vivas las melodías coloniales y mineras de la región.', 'colonial', 'active'),
  ('Colectivo Ecos del Pasado', 'ecos-del-pasado', 'Colectivo de artistas locales que fusionan sonidos históricos con producción contemporánea.', 'contemporary', 'active'),
  ('Archivos Sonoros RDM', 'archivos-sonoros', 'Archivo histórico de grabaciones, testimonios y ambientes de Real del Monte desde 1920.', 'cornish', 'featured'),
  ('Pasteleros de la Noche', 'pasteleros-noche', 'Música ambiental y narrativa inspirada en las tradiciones nocturnas del pueblo.', 'modern', 'active'),
  ('Cornish Heritage Choir', 'cornish-heritage', 'Coro que preserva los himnos y canciones cornish traídos por los mineros del siglo XIX.', 'cornish', 'active');

INSERT INTO music_albums (artist_id, title, slug, description, album_type, canonical_level, release_year, genres, total_tracks) VALUES
  ((SELECT id FROM music_artists WHERE slug = 'archivos-sonoros'), 'Memoria Minera: Grabaciones 1920-1960', 'memoria-minera-1920-1960', 'Colección de grabaciones históricas de la vida minera de Real del Monte. Testimonios, cantos de trabajo y ambientes de mina.', 'archive', 'historical', 1960, ARRAY['folk', 'documental', 'ambiental'], 12),
  ((SELECT id FROM music_artists WHERE slug = 'cornish-heritage'), 'Himnos de Cornualles en la Sierra', 'himnos-cornualles-sierra', 'Los himnos y canciones que los mineros cornish trajeron a México, reinterpretados con la acústica de la sierra.', 'compilation', 'artistic', 2020, ARRAY['folk', 'coral', 'herencia'], 8),
  ((SELECT id FROM music_artists WHERE slug = 'ecos-del-pasado'), 'Crónicas Sonoras del Centro Histórico', 'cronicas-centro-historico', 'Paseo sonoro por las calles empedradas, plazas y rincones del centro histórico de Real del Monte.', 'studio', 'artistic', 2024, ARRAY['ambiental', 'narrativo', 'experimental'], 10),
  ((SELECT id FROM music_artists WHERE slug = 'comunidad-minera'), 'Voces de la Plata', 'voces-de-la-plata', 'Canciones tradicionales de la comunidad minera, desde los cantos de trabajo hasta las serenatas en la plaza.', 'live', 'community', 2023, ARRAY['tradicional', 'ranchera', 'coral'], 14),
  ((SELECT id FROM music_artists WHERE slug = 'tamborileros-sierra'), 'Rituales y Festividades', 'rituales-festividades', 'Música para las festividades principales de RDM: Día de Muertos, Semana Santa, Festival del Paste.', 'studio', 'artistic', 2022, ARRAY['ritual', 'festivo', 'tradicional'], 9);

-- ============================================================================
-- 13. SEED DATA — Tracks (with spatial audio profiles)
-- ============================================================================

INSERT INTO music_tracks (album_id, artist_id, title, slug, duration_ms, track_number, canonical_level, location_name, era, spatial_profiles) VALUES
  ((SELECT id FROM music_albums WHERE slug = 'memoria-minera-1920-1960'), (SELECT id FROM music_artists WHERE slug = 'archivos-sonoros'),
   'Grito de Minero (1923)', 'grito-minero-1923', 245000, 1, 'historical', 'Mina de Acosta', 'minero',
   '{"archivo": {"reverb": 0.15}, "espacio": {"reverb": 0.85, "panorama": true, "hrtf": true}, "metaverso": {"reverb": 0.9, "effects": ["echo", "depth"]}}'),
  ((SELECT id FROM music_albums WHERE slug = 'memoria-minera-1920-1960'), (SELECT id FROM music_artists WHERE slug = 'archivos-sonoros'),
   'Campanas de la Asunción al Amanecer', 'campanas-asuncion-amanecer', 180000, 2, 'historical', 'Parroquia de la Asunción', 'colonial',
   '{"archivo": {"reverb": 0.2}, "espacio": {"reverb": 0.7, "panorama": true}, "metaverso": {"reverb": 0.8, "effects": ["chorus"]}}'),
  ((SELECT id FROM music_albums WHERE slug = 'memoria-minera-1920-1960'), (SELECT id FROM music_artists WHERE slug = 'archivos-sonoros'),
   'Lluvia sobre el Panteón Inglés', 'lluvia-panteon-ingles', 320000, 3, 'historical', 'Panteón Inglés', 'cornish',
   '{"archivo": {"reverb": 0.1}, "espacio": {"reverb": 0.65, "panorama": true, "rain": true}, "metaverso": {"reverb": 0.75, "effects": ["rain", "wind"]}}'),
  ((SELECT id FROM music_albums WHERE slug = 'himnos-cornualles-sierra'), (SELECT id FROM music_artists WHERE slug = 'cornish-heritage'),
   'Hymn to Cornish Miners', 'hymn-cornish-miners', 280000, 1, 'artistic', 'Real del Monte Centro', 'cornish',
   '{"archivo": {"reverb": 0.15}, "espacio": {"reverb": 0.6, "panorama": true, "hrtf": true}, "metaverso": {"reverb": 0.7, "effects": ["choir"]}}'),
  ((SELECT id FROM music_albums WHERE slug = 'himnos-cornualles-sierra'), (SELECT id FROM music_artists WHERE slug = 'cornish-heritage'),
   'Trelawny en la Sierra', 'trelawny-sierra', 210000, 2, 'artistic', 'Mirador La Cruz', 'cornish',
   '{"archivo": {"reverb": 0.1}, "espacio": {"reverb": 0.5, "panorama": true}, "metaverso": {"reverb": 0.65, "effects": ["mountain_echo"]}}'),
  ((SELECT id FROM music_albums WHERE slug = 'cronicas-centro-historico'), (SELECT id FROM music_artists WHERE slug = 'ecos-del-pasado'),
   'Paso de la Calle Em pedrada', 'paso-calle-empedrada', 420000, 1, 'artistic', 'Callejón del Romance', 'contemporary',
   '{"archivo": {"reverb": 0.1}, "espacio": {"reverb": 0.55, "panorama": true, "footsteps": true}, "metaverso": {"reverb": 0.6, "effects": ["spatial_walk"]}}'),
  ((SELECT id FROM music_albums WHERE slug = 'cronicas-centro-historico'), (SELECT id FROM music_artists WHERE slug = 'ecos-del-pasado'),
   'El Paste y la Plata: Diálogo Sonoro', 'paste-plata-dialogo', 380000, 2, 'artistic', 'Plaza Principal', 'contemporary',
   '{"archivo": {"reverb": 0.1}, "espacio": {"reverb": 0.5, "panorama": true}, "metaverso": {"reverb": 0.6, "effects": ["ambient_crowd"]}}'),
  ((SELECT id FROM music_albums WHERE slug = 'voces-de-la-plata'), (SELECT id FROM music_artists WHERE slug = 'comunidad-minera'),
   'La Malagueña de la Sierra', 'malaguena-sierra', 295000, 1, 'community', 'Plaza Principal', 'modern',
   '{"archivo": {"reverb": 0.1}, "espacio": {"reverb": 0.45, "panorama": true}, "metaverso": {"reverb": 0.55, "effects": ["reverb_plaza"]}}'),
  ((SELECT id FROM music_albums WHERE slug = 'voces-de-la-plata'), (SELECT id FROM music_artists WHERE slug = 'comunidad-minera'),
   'Canto al Minero Olvidado', 'canto-minero-olvidado', 260000, 3, 'community', 'Mina de La Dificultad', 'minero',
   '{"archivo": {"reverb": 0.15}, "espacio": {"reverb": 0.8, "panorama": true, "hrtf": true}, "metaverso": {"reverb": 0.85, "effects": ["mine_echo", "dripping"]}}'),
  ((SELECT id FROM music_albums WHERE slug = 'rituales-festivades'), (SELECT id FROM music_artists WHERE slug = 'tamborileros-sierra'),
   'Danza de los Viejitos de RDM', 'danza-viejitos-rdm', 340000, 1, 'artistic', 'Plaza Principal', 'colonial',
   '{"archivo": {"reverb": 0.1}, "espacio": {"reverb": 0.5, "panorama": true}, "metaverso": {"reverb": 0.6, "effects": ["festive"]}}'),
  ((SELECT id FROM music_albums WHERE slug = 'rituales-festivades'), (SELECT id FROM music_artists WHERE slug = 'tamborileros-sierra'),
   'Procesión del Viernes Santo', 'procesion-viernes-santo', 480000, 4, 'artistic', 'Centro Histórico', 'colonial',
   '{"archivo": {"reverb": 0.2}, "espacio": {"reverb": 0.75, "panorama": true, "procession": true}, "metaverso": {"reverb": 0.85, "effects": ["church_bells", "procession"]}}');

-- ============================================================================
-- 14. SEED DATA — Crónicas Sonoras
-- ============================================================================

INSERT INTO music_cronicas (title, slug, description, cronica_type, canonical_level, total_duration_ms) VALUES
  ('Ruta del Paste Sonora', 'ruta-paste-sonora', 'Paseo sonoro por los places, pastelerías y rincones donde nace el paste de Real del Monte. Música, relatos y ambientes.', 'ruta', 'artistic', 2400000),
  ('Memoria Minera: Testimonios y Cantos', 'memoria-minera-testimonios', 'Crónica que combina grabaciones históricas con cantos mineros y testimonios de los últimos mineros de RDM.', 'memoria', 'historical', 1800000),
  ('Día de Muertos en Real del Monte', 'dia-muertos-rdm', 'Los sonidos de la celebración: cantos, procesiones, veladas y la música que acompaña a los espíritus.', 'ambiental', 'artistic', 2100000),
  ('Neblina y Cantos del Bosque', 'neblina-cantos-bosque', 'Sonidos del bosque de oyamel, aves, viento y la música que la neblina inspira a los artistas locales.', 'ambiental', 'community', 1500000),
  ('Cornish Echoes: 200 Años', 'cornish-echoes-200', 'Viaje sonoro desde Cornualles hasta la sierra de Pachuca. Himnos, testimonios y la fusión de dos mundos.', 'mixed', 'artistic', 2700000);

-- Link tracks to crónicas
INSERT INTO music_cronica_tracks (cronica_id, track_id, position, transition_type) VALUES
  ((SELECT id FROM music_cronicas WHERE slug = 'ruta-paste-sonora'), (SELECT id FROM music_tracks WHERE slug = 'paste-plata-dialogo'), 1, 'crossfade'),
  ((SELECT id FROM music_cronicas WHERE slug = 'ruta-paste-sonora'), (SELECT id FROM music_tracks WHERE slug = 'paso-calle-empedrada'), 2, 'narrative_gap'),
  ((SELECT id FROM music_cronicas WHERE slug = 'memoria-minera-testimonios'), (SELECT id FROM music_tracks WHERE slug = 'grito-minero-1923'), 1, 'crossfade'),
  ((SELECT id FROM music_cronicas WHERE slug = 'memoria-minera-testimonios'), (SELECT id FROM music_tracks WHERE slug = 'canto-minero-olvidado'), 2, 'narrative_gap'),
  ((SELECT id FROM music_cronicas WHERE slug = 'dia-muertos-rdm'), (SELECT id FROM music_tracks WHERE slug = 'campanas-asuncion-amanecer'), 1, 'crossfade'),
  ((SELECT id FROM music_cronicas WHERE slug = 'dia-muertos-rdm'), (SELECT id FROM music_tracks WHERE slug = 'procesion-viernes-santo'), 2, 'narrative_gap'),
  ((SELECT id FROM music_cronicas WHERE slug = 'neblina-cantos-bosque'), (SELECT id FROM music_tracks WHERE slug = 'lluvia-panteon-ingles'), 1, 'crossfade'),
  ((SELECT id FROM music_cronicas WHERE slug = 'cornish-echoes-200'), (SELECT id FROM music_tracks WHERE slug = 'hymn-cornish-miners'), 1, 'crossfade'),
  ((SELECT id FROM music_cronicas WHERE slug = 'cornish-echoes-200'), (SELECT id FROM music_tracks WHERE slug = 'trelawny-sierra'), 2, 'narrative_gap');

-- ============================================================================
-- 15. SEED DATA — Music Events
-- ============================================================================

INSERT INTO music_events (event_code, title, description, event_type, starts_at, location_name, is_virtual, reward_json) VALUES
  ('ECO-ARCHIVO-001', 'Sesión de Archivo: Voces de la Mina', 'Escucha comentada de grabaciones históricas de los mineros de RDM con historiadores locales.', 'archive_session', '2025-08-01 19:00:00-06', 'Museo de la Minería', true,
   '{"xp": 200, "badge_code": "guardian_archivo_sonoro"}'),
  ('ECO-LISTEN-001', 'Escucha Colectiva: Crónicas del Centro', 'Sesión sincronizada de las Crónicas Sonoras del Centro Histórico con chat en vivo.', 'listening_party', '2025-08-15 20:00:00-06', 'Virtual', true,
   '{"xp": 150}'),
  ('ECO-CONCIERTO-001', 'Concierto: Voces de la Plata en Vivo', 'Presentación en vivo del álbum Voces de la Plata en la Plaza Principal.', 'concert', '2025-09-01 21:00:00-06', 'Plaza Principal', false,
   '{"xp": 300, "badge_code": "mecenas_concierto"}');
