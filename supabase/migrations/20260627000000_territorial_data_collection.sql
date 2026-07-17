-- Territorial Data Collection System
-- Schema for user-contributed geo-tagged data that builds the digital twin

-- ============================================================================
-- USER CONTRIBUTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('checkin', 'review', 'photo', 'rating', 'tip', 'event_report', 'route_trace', 'poi_suggestion')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'flagged', 'archived')),
  coords JSONB NOT NULL,
  territorio TEXT NOT NULL DEFAULT 'RDM',
  poi_id TEXT,
  payload JSONB NOT NULL,
  verification_method TEXT CHECK (verification_method IN ('auto_geo', 'photo_confirm', 'peer_review', 'isabella_validation')),
  verification_score REAL DEFAULT 0,
  reputation_weight REAL DEFAULT 0.5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Spatial index for geo queries
CREATE INDEX IF NOT EXISTS idx_user_contributions_coords ON user_contributions USING GIST (
  ST_SetSRID(ST_MakePoint((coords->>'lng')::float, (coords->>'lat')::float), 4326)
);

CREATE INDEX IF NOT EXISTS idx_user_contributions_type ON user_contributions(type);
CREATE INDEX IF NOT EXISTS idx_user_contributions_status ON user_contributions(status);
CREATE INDEX IF NOT EXISTS idx_user_contributions_territorio ON user_contributions(territorio);
CREATE INDEX IF NOT EXISTS idx_user_contributions_user_id ON user_contributions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_contributions_poi_id ON user_contributions(poi_id);
CREATE INDEX IF NOT EXISTS idx_user_contributions_created_at ON user_contributions(created_at DESC);

-- ============================================================================
-- USER TERRITORIAL PROFILES
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_territorial_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_contributions INT NOT NULL DEFAULT 0,
  reputation_score REAL NOT NULL DEFAULT 0.5,
  verified_count INT NOT NULL DEFAULT 0,
  favorite_zones TEXT[] DEFAULT '{}',
  badges TEXT[] DEFAULT '{}',
  contribution_streak INT NOT NULL DEFAULT 0,
  last_contribution TIMESTAMPTZ,
  trust_level TEXT NOT NULL DEFAULT 'newcomer' CHECK (trust_level IN ('newcomer', 'regular', 'trusted', 'guardian')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- TERRITORIAL HEATMAP
-- ============================================================================
CREATE TABLE IF NOT EXISTS territorial_heatmap (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coords JSONB NOT NULL,
  intensity REAL NOT NULL DEFAULT 0.3,
  contribution_type TEXT NOT NULL,
  count INT NOT NULL DEFAULT 1,
  last_activity TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_territorial_heatmap_coords ON territorial_heatmap USING GIST (
  ST_SetSRID(ST_MakePoint((coords->>'lng')::float, (coords->>'lat')::float), 4326)
);

CREATE INDEX IF NOT EXISTS idx_territorial_heatmap_intensity ON territorial_heatmap(intensity DESC);

-- ============================================================================
-- CONTRIBUTION VERIFICATION LOG
-- ============================================================================
CREATE TABLE IF NOT EXISTS contribution_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contribution_id UUID NOT NULL REFERENCES user_contributions(id) ON DELETE CASCADE,
  verified_by TEXT NOT NULL CHECK (verified_by IN ('system', 'isabella', 'peer')),
  previous_status TEXT NOT NULL,
  new_status TEXT NOT NULL,
  score_delta REAL NOT NULL DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_contribution_verifications_contribution_id ON contribution_verifications(contribution_id);

-- ============================================================================
-- ISABELLA TERRITORIAL INSIGHTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS isabella_territorial_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL CHECK (tipo IN ('patron', 'alerta', 'recomendacion', 'descubrimiento', 'tendencia')),
  mensaje TEXT NOT NULL,
  confianza REAL NOT NULL DEFAULT 0.5,
  contribuciones_relacionadas INT DEFAULT 0,
  zona TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_isabella_territorial_insights_tipo ON isabella_territorial_insights(tipo);
CREATE INDEX IF NOT EXISTS idx_isabella_territorial_insights_created_at ON isabella_territorial_insights(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE user_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_territorial_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE territorial_heatmap ENABLE ROW LEVEL SECURITY;
ALTER TABLE contribution_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE isabella_territorial_insights ENABLE ROW LEVEL SECURITY;

-- Users can read all verified contributions
CREATE POLICY "Anyone can read verified contributions"
  ON user_contributions FOR SELECT
  USING (status = 'verified' OR auth.uid() = user_id);

-- Users can insert their own contributions
CREATE POLICY "Users can insert own contributions"
  ON user_contributions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own pending contributions
CREATE POLICY "Users can update own pending contributions"
  ON user_contributions FOR UPDATE
  USING (auth.uid() = user_id AND status = 'pending');

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON user_territorial_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Anyone can read heatmap
CREATE POLICY "Anyone can read heatmap"
  ON territorial_heatmap FOR SELECT
  USING (true);

-- Anyone can read verified insights
CREATE POLICY "Anyone can read insights"
  ON isabella_territorial_insights FOR SELECT
  USING (true);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Get nearby contributions
CREATE OR REPLACE FUNCTION get_nearby_contributions(
  lat float,
  lng float,
  radius_meters float DEFAULT 500,
  min_status text DEFAULT 'verified'
)
RETURNS SETOF user_contributions
LANGUAGE sql STABLE
AS $$
  SELECT *
  FROM user_contributions
  WHERE status = min_status
    AND ST_DWithin(
      ST_SetSRID(ST_MakePoint((coords->>'lng')::float, (coords->>'lat')::float), 4326),
      ST_SetSRID(ST_MakePoint(lng, lat), 4326),
      radius_meters
    )
  ORDER BY created_at DESC;
$$;

-- Get territorial stats
CREATE OR REPLACE FUNCTION get_territorial_stats()
RETURNS json
LANGUAGE sql STABLE
AS $$
  SELECT json_build_object(
    'total_contributions', (SELECT count(*) FROM user_contributions),
    'unique_contributors', (SELECT count(DISTINCT user_id) FROM user_contributions),
    'active_pois', (SELECT count(DISTINCT poi_id) FROM user_contributions WHERE poi_id IS NOT NULL),
    'checkins_today', (SELECT count(*) FROM user_contributions WHERE type = 'checkin' AND created_at >= CURRENT_DATE),
    'average_rating', COALESCE((SELECT avg((payload->>'score')::float) FROM user_contributions WHERE type = 'rating' AND payload->>'score' IS NOT NULL), 0),
    'verified_rate', COALESCE(
      (SELECT count(*)::float / NULLIF(count(*), 0) FROM user_contributions WHERE status = 'verified') /
      NULLIF((SELECT count(*)::float FROM user_contributions), 0),
      0
    )
  );
$$;
