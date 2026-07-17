-- Pipeline Results and Unified System Tables
-- Extends the territorial data collection system with pipeline tracking

-- ============================================================================
-- PIPELINE RESULTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS pipeline_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trace_id UUID NOT NULL UNIQUE,
  input_type TEXT NOT NULL,
  emotional_state TEXT,
  emotional_valence REAL,
  consciousness_layers TEXT[] DEFAULT '{}',
  federation_actions INT DEFAULT 0,
  territorial_actions INT DEFAULT 0,
  guardian_action TEXT,
  duration_ms INT NOT NULL DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pipeline_results_trace_id ON pipeline_results(trace_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_results_input_type ON pipeline_results(input_type);
CREATE INDEX IF NOT EXISTS idx_pipeline_results_emotional_state ON pipeline_results(emotional_state);
CREATE INDEX IF NOT EXISTS idx_pipeline_results_created_at ON pipeline_results(created_at DESC);

-- ============================================================================
-- TERRITORIAL SNAPSHOTS (point-in-time system state)
-- ============================================================================
CREATE TABLE IF NOT EXISTS territorial_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stats JSONB NOT NULL,
  heat_points JSONB DEFAULT '[]',
  active_zones JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_territorial_snapshots_created_at ON territorial_snapshots(created_at DESC);

-- ============================================================================
-- SYSTEM ALERTS (from supervisor)
-- ============================================================================
CREATE TABLE IF NOT EXISTS system_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_name TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_system_alerts_severity ON system_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_system_alerts_created_at ON system_alerts(created_at DESC);

-- ============================================================================
-- FEDERATION HEALTH HISTORY
-- ============================================================================
CREATE TABLE IF NOT EXISTS federation_health_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  federation_id TEXT NOT NULL,
  status TEXT NOT NULL,
  health REAL NOT NULL,
  operational_score REAL NOT NULL,
  snapshot_time TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fed_health_federation_id ON federation_health_history(federation_id);
CREATE INDEX IF NOT EXISTS idx_fed_health_snapshot_time ON federation_health_history(snapshot_time DESC);

-- ============================================================================
-- USER REPUTATION LOG
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_reputation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  reputation_score REAL NOT NULL,
  trust_level TEXT,
  change_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_reputation_log_user_id ON user_reputation_log(user_id);
CREATE INDEX IF NOT EXISTS idx_user_reputation_log_created_at ON user_reputation_log(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE pipeline_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE territorial_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE federation_health_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_reputation_log ENABLE ROW LEVEL SECURITY;

-- Admin-only tables (readable by authenticated users)
CREATE POLICY "Authenticated users can read pipeline results"
  ON pipeline_results FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read snapshots"
  ON territorial_snapshots FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read alerts"
  ON system_alerts FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can read federation health"
  ON federation_health_history FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Users can read own reputation log"
  ON user_reputation_log FOR SELECT
  USING (auth.uid() = user_id OR auth.role() = 'authenticated');

-- Service role can insert into all tables
CREATE POLICY "Service role can insert pipeline results"
  ON pipeline_results FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can insert snapshots"
  ON territorial_snapshots FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can insert alerts"
  ON system_alerts FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Service role can insert federation health"
  ON federation_health_history FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Get system health summary
CREATE OR REPLACE FUNCTION get_system_health_summary()
RETURNS json
LANGUAGE sql STABLE
AS $$
  SELECT json_build_object(
    'total_pipelines', (SELECT count(*) FROM pipeline_results),
    'avg_duration_ms', COALESCE((SELECT avg(duration_ms)::int FROM pipeline_results), 0),
    'total_contributions', (SELECT count(*) FROM user_contributions),
    'critical_alerts_24h', (SELECT count(*) FROM system_alerts WHERE severity = 'critical' AND created_at >= now() - interval '24 hours'),
    'avg_federation_health', COALESCE(
      (SELECT avg(health) FROM federation_health_history WHERE snapshot_time >= now() - interval '1 hour'),
      0
    ),
    'last_snapshot', (SELECT max(created_at) FROM territorial_snapshots)
  );
$$;

-- Clean old pipeline results (retain 7 days)
CREATE OR REPLACE FUNCTION clean_old_pipeline_results()
RETURNS void
LANGUAGE sql
AS $$
  DELETE FROM pipeline_results WHERE created_at < now() - interval '7 days';
  DELETE FROM system_alerts WHERE created_at < now() - interval '30 days';
  DELETE FROM federation_health_history WHERE snapshot_time < now() - interval '7 days';
$$;
