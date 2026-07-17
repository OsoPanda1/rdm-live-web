-- ============================================================================
-- Gamification LTOS Engine — Database Schema
-- Real del Monte Digital Hub
--
-- Federated gamification system integrated with LTOS and RDM Digital Hub.
-- All events flow through the event bus. Every action is traceable.
-- ============================================================================

-- ============================================================================
-- 1. SEASONS (Temporary campaigns)
-- ============================================================================

CREATE TABLE IF NOT EXISTS gamification_seasons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  theme TEXT NOT NULL, -- e.g., 'minas_inglesas', 'dia_muertos', 'festival_paste'
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  global_goal JSONB DEFAULT '{}', -- { type: 'xp_total', target: 100000, current: 0 }
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed', 'cancelled')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. PLAYERS (Unified identity: Hub user + LTOS player)
-- ============================================================================

CREATE TABLE IF NOT EXISTS gamification_players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  territory_id TEXT DEFAULT 'rdm', -- territory scope
  display_name TEXT,
  avatar_url TEXT,
  total_xp INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  current_season_id UUID REFERENCES gamification_seasons(id),
  -- XP Tracks (dual reputation system)
  xp_cultura INTEGER DEFAULT 0, -- Cultural missions
  xp_comunidad INTEGER DEFAULT 0, -- Community support
  xp_juego INTEGER DEFAULT 0, -- Pure gameplay
  -- Federated roles
  roles TEXT[] DEFAULT ARRAY['aprendiz_minero'],
  -- Stats
  quests_completed INTEGER DEFAULT 0,
  combos_total INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_active_at TIMESTAMPTZ,
  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================================================
-- 3. QUESTS (Missions with multi-layer criteria)
-- ============================================================================

CREATE TABLE IF NOT EXISTS gamification_quests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  season_id UUID REFERENCES gamification_seasons(id),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  -- Quest type: 'puzzle', 'narrative', 'territorial', 'community'
  quest_type TEXT NOT NULL CHECK (quest_type IN ('puzzle', 'narrative', 'territorial', 'community')),
  -- Track: which XP track this quest contributes to
  track TEXT NOT NULL CHECK (track IN ('cultura', 'comunidad', 'juego')),
  -- Criteria: flexible JSON rules engine
  criteria_json JSONB NOT NULL DEFAULT '{}',
  -- Example criteria:
  -- { "type": "combo_count", "piece_types": ["pastes", "minas"], "min_count": 10 }
  -- { "type": "visit_pages", "pages": ["/historia", "/atlas"], "min_visits": 3 }
  -- { "type": "complete_chain", "steps": ["minas", "panteon", "pastes"] }
  -- Rewards
  reward_json JSONB NOT NULL DEFAULT '{}',
  -- { "xp": 500, "badge_code": "minero_explorador", "voucher": "10_percent_paste" }
  -- Difficulty & prerequisites
  difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard', 'legendary')),
  prerequisite_quest_codes TEXT[] DEFAULT '{}',
  -- Time limits
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  -- Repeat config
  repeatable BOOLEAN DEFAULT false,
  max_repeats INTEGER DEFAULT 1,
  cooldown_hours INTEGER DEFAULT 0,
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'archived')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 4. PLAYER QUEST PROGRESS (Tracks individual quest completion)
-- ============================================================================

CREATE TABLE IF NOT EXISTS gamification_player_quests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES gamification_players(id) ON DELETE CASCADE,
  quest_id UUID NOT NULL REFERENCES gamification_quests(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'failed', 'expired')),
  progress_json JSONB DEFAULT '{}', -- { "current": 5, "target": 10 }
  completed_at TIMESTAMPTZ,
  repeat_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(player_id, quest_id)
);

-- ============================================================================
-- 5. GAME EVENTS (All events from Construct 3 and Hub)
-- ============================================================================

CREATE TABLE IF NOT EXISTS gamification_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID REFERENCES gamification_players(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL, -- 'combo', 'quest_complete', 'level_up', 'badge_earned', 'voucher_redeemed'
  source TEXT NOT NULL DEFAULT 'construct3', -- 'construct3', 'hub', 'api', 'webhook'
  payload_json JSONB NOT NULL DEFAULT '{}',
  -- XP earned in this event
  xp_earned INTEGER DEFAULT 0,
  xp_track TEXT, -- which track
  -- Territory context
  territory_id TEXT DEFAULT 'rdm',
  -- Derived events emitted
  derived_events TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for real-time queries
CREATE INDEX IF NOT EXISTS idx_gamification_events_player ON gamification_events(player_id);
CREATE INDEX IF NOT EXISTS idx_gamification_events_type ON gamification_events(event_type);
CREATE INDEX IF NOT EXISTS idx_gamification_events_created ON gamification_events(created_at DESC);

-- ============================================================================
-- 6. BADGES (Achievements)
-- ============================================================================

CREATE TABLE IF NOT EXISTS gamification_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_url TEXT,
  -- Rarity: common, rare, epic, legendary
  rarity TEXT NOT NULL DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  -- Category: cultural, community, gameplay, territorial
  category TEXT NOT NULL DEFAULT 'gameplay',
  -- Criteria to earn
  criteria_json JSONB NOT NULL DEFAULT '{}',
  -- XP bonus on earn
  xp_bonus INTEGER DEFAULT 0,
  -- Max players who can earn (0 = unlimited)
  max_earners INTEGER DEFAULT 0,
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'hidden', 'retired')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 7. PLAYER BADGES (Earned badges)
-- ============================================================================

CREATE TABLE IF NOT EXISTS gamification_player_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES gamification_players(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES gamification_badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  quest_id UUID REFERENCES gamification_quests(id),
  metadata JSONB DEFAULT '{}',
  UNIQUE(player_id, badge_id)
);

-- ============================================================================
-- 8. REWARDS (Vouchers, physical prizes, access)
-- ============================================================================

CREATE TABLE IF NOT EXISTS gamification_rewards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  -- Reward type: 'voucher', 'discount', 'access', 'physical', 'xp_boost'
  reward_type TEXT NOT NULL CHECK (reward_type IN ('voucher', 'discount', 'access', 'physical', 'xp_boost')),
  -- Value: discount percentage, XP boost, etc.
  value JSONB NOT NULL DEFAULT '{}',
  -- { "percent": 10, "min_purchase": 100 }
  -- { "xp_multiplier": 2, "duration_hours": 24 }
  -- { "access_module": "telemetry_dashboard" }
  -- Business/commerce integration
  business_id UUID, -- references businesses table
  -- Limitations
  max_claims INTEGER DEFAULT 0, -- 0 = unlimited
  claimed_count INTEGER DEFAULT 0,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'expired', 'redeemed')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 9. PLAYER REWARDS (Claimed/redeemed rewards)
-- ============================================================================

CREATE TABLE IF NOT EXISTS gamification_player_rewards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES gamification_players(id) ON DELETE CASCADE,
  reward_id UUID NOT NULL REFERENCES gamification_rewards(id) ON DELETE CASCADE,
  -- Voucher code for physical redemption
  voucher_code TEXT UNIQUE DEFAULT ('V-' || UPPER(SUBSTR(MD5(RANDOM()::TEXT), 1, 8))),
  status TEXT DEFAULT 'claimed' CHECK (status IN ('claimed', 'redeemed', 'expired', 'cancelled')),
  claimed_at TIMESTAMPTZ DEFAULT NOW(),
  redeemed_at TIMESTAMPTZ,
  redeemed_by TEXT, -- business user who validated
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 10. TERRITORIAL EVENTS (Real-world events linked to game)
-- ============================================================================

CREATE TABLE IF NOT EXISTS gamification_territorial_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('festival', 'cultural', 'seasonal', 'community')),
  -- Linked season
  season_id UUID REFERENCES gamification_seasons(id),
  -- Real-world event data
  location_name TEXT,
  location_lat NUMERIC,
  location_lng NUMERIC,
  event_date TIMESTAMPTZ,
  -- Game impact: bonus XP, special quests, etc.
  game_impact JSONB DEFAULT '{}',
  -- { "xp_multiplier": 1.5, "special_quests": ["quest_code_1"], "bonus_rewards": ["reward_code_1"] }
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 11. LEADERBOARD VIEWS (Materialized for performance)
-- ============================================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS gamification_leaderboard_season AS
SELECT
  p.id AS player_id,
  p.user_id,
  p.display_name,
  p.avatar_url,
  p.total_xp,
  p.level,
  p.xp_cultura,
  p.xp_comunidad,
  p.xp_juego,
  p.roles,
  p.current_season_id,
  s.code AS season_code,
  ROW_NUMBER() OVER (
    PARTITION BY p.current_season_id
    ORDER BY p.total_xp DESC
  ) AS rank
FROM gamification_players p
LEFT JOIN gamification_seasons s ON s.id = p.current_season_id
WHERE s.status = 'active';

CREATE UNIQUE INDEX IF NOT EXISTS idx_leaderboard_season_player
  ON gamification_leaderboard_season(player_id, season_code);

-- ============================================================================
-- 12. RLS POLICIES
-- ============================================================================

-- Players can read their own data
ALTER TABLE gamification_players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Players read own data" ON gamification_players
  FOR SELECT USING (auth.uid() = user_id);

-- Players can update their own data
CREATE POLICY "Players update own data" ON gamification_players
  FOR UPDATE USING (auth.uid() = user_id);

-- Events: players can insert their own events
ALTER TABLE gamification_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Players insert own events" ON gamification_events
  FOR INSERT WITH CHECK (player_id IN (SELECT id FROM gamification_players WHERE user_id = auth.uid()));

-- Events: players can read their own events
CREATE POLICY "Players read own events" ON gamification_events
  FOR SELECT USING (player_id IN (SELECT id FROM gamification_players WHERE user_id = auth.uid()));

-- Quests: public read
ALTER TABLE gamification_quests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Quests public read" ON gamification_quests
  FOR SELECT USING (true);

-- Player quests: players can read their own
ALTER TABLE gamification_player_quests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Player quests read own" ON gamification_player_quests
  FOR SELECT USING (player_id IN (SELECT id FROM gamification_players WHERE user_id = auth.uid()));

-- Badges: public read
ALTER TABLE gamification_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Badges public read" ON gamification_badges
  FOR SELECT USING (true);

-- Player badges: public read (showcase)
ALTER TABLE gamification_player_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Player badges public read" ON gamification_player_badges
  FOR SELECT USING (true);

-- Rewards: public read active rewards
ALTER TABLE gamification_rewards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Rewards public read" ON gamification_rewards
  FOR SELECT USING (status = 'active');

-- Player rewards: players can read their own
ALTER TABLE gamification_player_rewards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Player rewards read own" ON gamification_player_rewards
  FOR SELECT USING (player_id IN (SELECT id FROM gamification_players WHERE user_id = auth.uid()));

-- Seasons: public read
ALTER TABLE gamification_seasons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Seasons public read" ON gamification_seasons
  FOR SELECT USING (true);

-- Territorial events: public read
ALTER TABLE gamification_territorial_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Territorial events public read" ON gamification_territorial_events
  FOR SELECT USING (true);

-- ============================================================================
-- 13. SEED DATA
-- ============================================================================

-- Default Season
INSERT INTO gamification_seasons (code, name, description, theme, start_date, end_date, status, global_goal) VALUES
  ('S1-2025', 'Temporada Inaugural: Raices de Plata', 'La primera temporada del metajuego territorial de RDM Digital', 'minas_inglesas', '2025-07-01', '2025-09-30', 'active',
   '{"type": "community_xp", "target": 500000, "current": 0, "description": "XP colectivo de la comunidad para desbloquear evento especial"}');

-- Badges
INSERT INTO gamification_badges (code, name, description, rarity, category, criteria_json, xp_bonus) VALUES
  ('aprendiz_minero', 'Aprendiz Minero', 'Completaste tu primera mision cultural', 'common', 'cultural', '{"quests_completed_min": 1, "track": "cultura"}', 50),
  ('explorador_calles', 'Explorador de Calles', 'Visitaste 5 locations en el mapa', 'common', 'territorial', '{"locations_visited_min": 5}', 100),
  ('guardian_panteon', 'Guardian del Panteon', 'Completaste la mision Panteon Ingles', 'rare', 'cultural', '{"quest_code": "panteon_ingles"}', 200),
  ('maestro_pastes', 'Maestro de los Pastes', 'Acertaste 20 combos de pastes en el juego', 'rare', 'gameplay', '{"combos_pastes_min": 20}', 150),
  ('minero_legendario', 'Minero Legendario', 'Alcanzaste nivel 10 en el track Cultura', 'epic', 'cultural', '{"level_cultura_min": 10}', 500),
  ('corazon_comunidad', 'Corazon de la Comunidad', 'Donaste o apoyaste 3 comercios locales', 'rare', 'comunidad', '{"community_actions_min": 3}', 300),
  ('arquitecto_territorial', 'Arquitecto Territorial', 'Alcanzaste el nivel maximo en todos los tracks', 'legendary', 'territorial', '{"all_tracks_max": true}', 1000),
  ('leyenda_viva', 'Leyenda Viva', 'Completaste todas las misiones de una temporada', 'legendary', 'cultural', '{"all_season_quests": true}', 2000),
  ('combo_master', 'Combo Master', 'Lograste un combo de 15+ en el juego', 'epic', 'gameplay', '{"max_combo_min": 15}', 250),
  ('culturalista', 'Culturalista', 'Completaste 10 misiones culturales', 'epic', 'cultural', '{"cultural_quests_min": 10}', 400);

-- Starter Quests
INSERT INTO gamification_quests (code, name, description, quest_type, track, criteria_json, reward_json, difficulty, season_id) VALUES
  ('primera_mision', 'Primeros Pasos', 'Completar tu primera mision en el juego RDM Match', 'puzzle', 'juego',
   '{"type": "quest_complete", "min quests": 1}',
   '{"xp": 100, "badge_code": "aprendiz_minero"}',
   'easy', (SELECT id FROM gamification_seasons WHERE code = 'S1-2025')),

  ('explorador_rdm', 'Explorador de RDM', 'Visita 3 paginas del Hub (Historia, Mapa, Gastronomia)', 'narrative', 'cultura',
   '{"type": "visit_pages", "pages": ["/historia", "/mapa", "/gastronomia"], "min_visits": 1}',
   '{"xp": 200, "badge_code": "explorador_calles"}',
   'easy', (SELECT id FROM gamification_seasons WHERE code = 'S1-2025')),

  ('ruta_minera', 'Ruta de las Minas', 'Juega 5 partidas con piezas de minas y completa la ruta Minas+Panteon', 'narrative', 'cultura',
   '{"type": "chain", "steps": [{"game": "minas_played", "min": 5}, {"hub": "page_visit", "page": "/historia", "min": 1}]}',
   '{"xp": 350, "badge_code": "guardian_panteon"}',
   'medium', (SELECT id FROM gamification_seasons WHERE code = 'S1-2025')),

  ('combo_cultural', 'Combo Cultural', 'Logra un combo de 10 usando piezas culturales (capillas, calles, personajes)', 'puzzle', 'cultura',
   '{"type": "combo", "piece_types": ["capillas", "calles", "personajes"], "min_combo": 10}',
   '{"xp": 250}',
   'medium', (SELECT id FROM gamification_seasons WHERE code = 'S1-2025')),

  ('apoyo_comercio', 'Apoyo Local', 'Visita el directorio de comercios y apoya 2 negocios', 'community', 'comunidad',
   '{"type": "community_action", "action": "support_business", "min_count": 2}',
   '{"xp": 300, "badge_code": "corazon_comunidad"}',
   'medium', (SELECT id FROM gamification_seasons WHERE code = 'S1-2025')),

  ('maestro_puzzle', 'Maestro del Puzzle', 'Alcanza 50,000 puntos en una partida de RDM Match', 'puzzle', 'juego',
   '{"type": "score", "min_score": 50000}',
   '{"xp": 400, "badge_code": "maestro_pastes"}',
   'hard', (SELECT id FROM gamification_seasons WHERE code = 'S1-2025')),

  ('leyenda_plata', 'Leyenda de la Plata', 'Completar todas las misiones de la Temporada Inaugural', 'narrative', 'cultura',
   '{"type": "all_season_quests", "season_code": "S1-2025"}',
   '{"xp": 1000, "badge_code": "leyenda_viva"}',
   'legendary', (SELECT id FROM gamification_seasons WHERE code = 'S1-2025'));

-- Rewards
INSERT INTO gamification_rewards (code, name, description, reward_type, value, status) VALUES
  ('VOUCHER_PASTE_10', '10% Descuento en Pastes', 'Descuento del 10% en paste del dia en cualquier pasteleria participante', 'discount',
   '{"percent": 10, "min_purchase": 50}', 'active'),
  ('WIFI_1H', '1 Hora de Wi-Fi Gratis', '1 hora de Wi-Fi en cafes participantes de RDM', 'access',
   '{"duration_minutes": 60}', 'active'),
  ('TOUR_MINAS', 'Tour Virtual de Minas', 'Acceso al tour virtual interactivo de las minas historicas', 'access',
   '{"module": "tour_virtual_minas"}', 'active'),
  ('XP_BOOST_2X', 'XP Boost x2', 'Duplica tu XP por 24 horas', 'xp_boost',
   '{"xp_multiplier": 2, "duration_hours": 24}', 'active');

-- Territorial Events
INSERT INTO gamification_territorial_events (event_code, name, description, event_type, season_id, event_date, game_impact) VALUES
  ('FESTIVAL_PASTE_2025', 'Festival del Paste 2025', 'El festival gastronomico mas importante de RDM', 'festival',
   (SELECT id FROM gamification_seasons WHERE code = 'S1-2025'), '2025-08-15',
   '{"xp_multiplier": 1.5, "special_quests": ["combo_cultural"], "bonus_rewards": ["VOUCHER_PASTE_10"]}'),
  ('DIA_MUERTOS_2025', 'Dia de Muertos 2025', 'Celebracion cultural con misiones especiales', 'cultural',
   (SELECT id FROM gamification_seasons WHERE code = 'S1-2025'), '2025-11-01',
   '{"xp_multiplier": 2.0, "special_quests": ["ruta_minera"], "bonus_rewards": ["TOUR_MINAS"]}');
