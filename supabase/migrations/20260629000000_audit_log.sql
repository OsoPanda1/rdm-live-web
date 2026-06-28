-- ============================================================================
-- AUDIT LOG SISTEMA ISA-API v.GENESIS
-- ============================================================================
-- Registro inmutable de todas las acciones sensibles del sistema:
-- evaluaciones de LUMEN, decisiones del pipeline, cambios territoriales,
-- accesos a datos personales, operaciones de federación.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS audit_log (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type   TEXT NOT NULL,
  actor_id      TEXT NOT NULL,
  target_type   TEXT,
  target_id     TEXT,
  federation_id TEXT,
  skill_id      TEXT,
  decision      TEXT,
  rationale     TEXT,
  metadata      JSONB DEFAULT '{}',
  severity      TEXT NOT NULL DEFAULT 'info'
    CHECK (severity IN ('debug', 'info', 'warning', 'error', 'critical')),
  immutable_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_log_created_at ON audit_log (created_at DESC);
CREATE INDEX idx_audit_log_actor ON audit_log (actor_id);
CREATE INDEX idx_audit_log_action_type ON audit_log (action_type);
CREATE INDEX idx_audit_log_federation ON audit_log (federation_id);
CREATE INDEX idx_audit_log_severity ON audit_log (severity);

CREATE OR REPLACE FUNCTION compute_audit_hash()
RETURNS TRIGGER AS $$
BEGIN
  NEW.immutable_hash := encode(
    digest(
      NEW.id::TEXT || NEW.action_type || NEW.actor_id || NEW.created_at::TEXT || NEW.metadata::TEXT,
      'sha256'
    ),
    'hex'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_audit_log_hash ON audit_log;
CREATE TRIGGER trg_audit_log_hash
  BEFORE INSERT ON audit_log
  FOR EACH ROW
  EXECUTE FUNCTION compute_audit_hash();

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY audit_log_insert_service_role ON audit_log
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY audit_log_select_service_role ON audit_log
  FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY audit_log_select_authenticated_own ON audit_log
  FOR SELECT
  TO authenticated
  USING (actor_id = auth.uid()::TEXT);

-- ============================================================================
-- FUNCIÓN: registrar entrada en audit log desde la API
-- ============================================================================
CREATE OR REPLACE FUNCTION register_audit_entry(
  p_action_type   TEXT,
  p_actor_id      TEXT,
  p_target_type   TEXT DEFAULT NULL,
  p_target_id     TEXT DEFAULT NULL,
  p_federation_id TEXT DEFAULT NULL,
  p_skill_id      TEXT DEFAULT NULL,
  p_decision      TEXT DEFAULT NULL,
  p_rationale     TEXT DEFAULT NULL,
  p_metadata      JSONB DEFAULT '{}',
  p_severity      TEXT DEFAULT 'info'
)
RETURNS UUID
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO audit_log (action_type, actor_id, target_type, target_id, federation_id, skill_id, decision, rationale, metadata, severity)
  VALUES (p_action_type, p_actor_id, p_target_type, p_target_id, p_federation_id, p_skill_id, p_decision, p_rationale, p_metadata, p_severity)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$ LANGUAGE plpgsql;

REVOKE EXECUTE ON FUNCTION register_audit_entry FROM PUBLIC, authenticated;
GRANT EXECUTE ON FUNCTION register_audit_entry TO service_role;

-- ============================================================================
-- FUNCIÓN: verificar integridad del audit log
-- ============================================================================
CREATE OR REPLACE FUNCTION verify_audit_integrity(p_id UUID)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_record audit_log;
  v_expected_hash TEXT;
BEGIN
  SELECT * INTO v_record FROM audit_log WHERE id = p_id;
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  v_expected_hash := encode(
    digest(
      v_record.id::TEXT || v_record.action_type || v_record.actor_id || v_record.created_at::TEXT || v_record.metadata::TEXT,
      'sha256'
    ),
    'hex'
  );
  RETURN v_record.immutable_hash = v_expected_hash;
END;
$$ LANGUAGE plpgsql;

REVOKE EXECUTE ON FUNCTION verify_audit_integrity FROM PUBLIC;
GRANT EXECUTE ON FUNCTION verify_audit_integrity TO service_role, authenticated;
