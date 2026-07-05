-- Migration: Gamification quests/rewards, music cronicles, extended gamification
-- Extends existing gamification_profiles and gamification_events tables

-- Gamification quests (weekly challenges, seasonal missions)
CREATE TABLE IF NOT EXISTS gamification_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  season_id TEXT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  quest_type TEXT NOT NULL DEFAULT 'weekly',
  criteria JSONB NOT NULL DEFAULT '{}',
  reward_xp INTEGER NOT NULL DEFAULT 100,
  reward_badge TEXT,
  reward_metadata JSONB DEFAULT '{}',
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Gamification rewards delivered to players
CREATE TABLE IF NOT EXISTS gamification_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quest_id UUID NOT NULL REFERENCES gamification_quests(id) ON DELETE CASCADE,
  delivered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}',
  UNIQUE(user_id, quest_id)
);

-- Gamification leaderboard materialized view
CREATE OR REPLACE VIEW gamification_leaderboard AS
SELECT
  gp.user_id,
  p.display_name,
  p.avatar_url,
  gp.points,
  gp.level,
  gp.badges,
  gp.streak_days,
  RANK() OVER (ORDER BY gp.points DESC) AS rank
FROM gamification_profiles gp
LEFT JOIN profiles p ON p.id = gp.user_id
ORDER BY gp.points DESC;

-- Music sonic cronicles (playlists narrativas)
CREATE TABLE IF NOT EXISTS music_cronicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  kind TEXT NOT NULL DEFAULT 'user',
  tags TEXT[] DEFAULT '{}',
  track_ids UUID[] DEFAULT '{}',
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  play_count INTEGER NOT NULL DEFAULT 0,
  like_count INTEGER NOT NULL DEFAULT 0,
  status content_status NOT NULL DEFAULT 'published',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Music listening sessions (real-time events)
CREATE TABLE IF NOT EXISTS music_listening_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  track_id UUID NOT NULL REFERENCES music_tracks(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT false,
  mode TEXT NOT NULL DEFAULT 'archive'
);

-- Music donations (mecenas system)
CREATE TABLE IF NOT EXISTS music_donations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_mxn INTEGER NOT NULL,
  track_id UUID REFERENCES music_tracks(id) ON DELETE SET NULL,
  cronicle_id UUID REFERENCES music_cronicles(id) ON DELETE SET NULL,
  provider_payment_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Mecenas tiers
CREATE TABLE IF NOT EXISTS music_mecenas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  tier TEXT NOT NULL DEFAULT 'oyente',
  total_donated_mxn INTEGER NOT NULL DEFAULT 0,
  since TIMESTAMPTZ NOT NULL DEFAULT now(),
  badge TEXT,
  metadata JSONB DEFAULT '{}'
);

-- RLS policies for new tables
ALTER TABLE gamification_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamification_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE music_cronicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE music_listening_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE music_donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE music_mecenas ENABLE ROW LEVEL SECURITY;

-- gamification_quests: public read, admin write
CREATE POLICY "Quests are viewable by everyone" ON gamification_quests FOR SELECT USING (true);
CREATE POLICY "Admins can manage quests" ON gamification_quests FOR ALL USING (has_role('admin'::app_role, auth.uid()));

-- gamification_rewards: users see own, admin see all
CREATE POLICY "Users view own rewards" ON gamification_rewards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins view all rewards" ON gamification_rewards FOR SELECT USING (has_role('admin'::app_role, auth.uid()));
CREATE POLICY "System inserts rewards" ON gamification_rewards FOR INSERT WITH CHECK (true);

-- music_cronicles: published are public, creators manage own
CREATE POLICY "Published cronicles are public" ON music_cronicles FOR SELECT USING (status = 'published');
CREATE POLICY "Creators manage own cronicles" ON music_cronicles FOR ALL USING (auth.uid() = creator_id);
CREATE POLICY "Admins manage all cronicles" ON music_cronicles FOR ALL USING (has_role('admin'::app_role, auth.uid()));

-- music_listening_sessions: users manage own
CREATE POLICY "Users manage own sessions" ON music_listening_sessions FOR ALL USING (auth.uid() = user_id);

-- music_donations: users see own
CREATE POLICY "Users view own donations" ON music_donations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own donations" ON music_donations FOR INSERT WITH CHECK (auth.uid() = user_id);

-- music_mecenas: users see own, public read for tiers
CREATE POLICY "Users view own mecenas" ON music_mecenas FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users upsert own mecenas" ON music_mecenas FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own mecenas" ON music_mecenas FOR UPDATE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_gamification_quests_active ON gamification_quests(is_active, ends_at);
CREATE INDEX IF NOT EXISTS idx_gamification_rewards_user ON gamification_rewards(user_id);
CREATE INDEX IF NOT EXISTS idx_music_cronicles_creator ON music_cronicles(creator_id);
CREATE INDEX IF NOT EXISTS idx_music_sessions_user ON music_listening_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_music_donations_user ON music_donations(user_id);

-- Seed some starter quests
INSERT INTO gamification_quests (code, title, description, quest_type, reward_xp, reward_badge, criteria) VALUES
  ('RDM-001', 'Primer Contacto', 'Completa tu perfil y selecciona tu capa federada', 'onboarding', 50, 'badge_primer_contacto', '{"action":"complete_profile"}'),
  ('RDM-002', 'Explorador del Atlas', 'Explora 5 puntos de interés en el mapa', 'weekly', 150, 'badge_explorador', '{"action":"explore_pois","count":5}'),
  ('RDM-003', 'Crónica Sonora', 'Crea tu primera crónica sonora con al menos 3 pistas', 'weekly', 200, 'badge_cronista_sonoro', '{"action":"create_cronicle","min_tracks":3}'),
  ('RDM-004', 'Mecenas del Patrimonio', 'Realiza tu primera donación al archivo sonoro', 'special', 300, 'badge_mecenas', '{"action":"first_donation"}'),
  ('RDM-005', 'Minero Digital', 'Alcanza 1000 puntos de experiencia total', 'milestone', 500, 'badge_minero_digital', '{"action":"reach_xp","target":1000}'),
  ('RDM-006', 'Guardián del Patrimonio', 'Alcanza nivel 5 y acumula 5000 puntos', 'milestone', 1000, 'badge_guardian', '{"action":"reach_level","target":5}'),
  ('RDM-007', 'Maestro del Hub', 'Alcanza el nivel máximo (10) con 20000 puntos', 'milestone', 5000, 'badge_maestro', '{"action":"reach_level","target":10}')
ON CONFLICT (code) DO NOTHING;
