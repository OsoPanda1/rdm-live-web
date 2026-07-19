export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type SandboxProfile = "CRITICAL_GVISOR" | "WASM_SECCOMP" | "WASM_DEFAULT";
export type FailureAction = "REJECT_REQUEST" | "RESTART_INSTANCE" | "RETRY_UPSTREAM" | "KILL_NODE";

export interface RuntimeIdentity {
  node_id: string;
  federation: string;
  version: string;
  boot_timestamp: string;
}

export interface TokenValidationConfig {
  enabled: boolean;
  min_key_strength: string;
  session_ttl_seconds: number;
}

export interface CORSConfig {
  allowed_origins: string[];
  allow_credentials: boolean;
}

export interface SecurityDefaults {
  zero_trust_level: "STRICT" | "STANDARD" | "PERMISSIVE";
  deny_by_default_on_ambiguity: boolean;
  allow_dynamic_loading: boolean;
  token_validation: TokenValidationConfig;
  cors: CORSConfig;
}

export interface CircuitBreakerConfig {
  enabled: boolean;
  failure_threshold: number;
  recovery_timeout_ms: number;
}

export interface FailurePolicies {
  on_exceeded_quota: FailureAction;
  on_sandbox_crash: FailureAction;
  on_network_timeout: FailureAction;
  max_retries: number;
  circuit_breaker: CircuitBreakerConfig;
}

export interface WASMPoolConfig {
  min_warm_instances: number;
  max_instances: number;
  idle_timeout_seconds: number;
  max_concurrent_per_plugin: number;
}

export interface PerformancePolicies {
  max_concurrent_invokes: number;
  max_batch_window_ms: number;
  max_batch_size: number;
  enable_batching: boolean;
  session_cache_ttl_seconds: number;
  wasm_pool: WASMPoolConfig;
}

export interface ExportersConfig {
  prometheus: { endpoint: string; enabled: boolean };
  otel_grpc: { endpoint: string; enabled: boolean };
}

export interface TelemetryPolicies {
  metrics_enabled: boolean;
  logs_enabled: boolean;
  traces_enabled: boolean;
  sampling_rate: number;
  redact_fields: string[];
  exporters: ExportersConfig;
}

export interface PluginQuotas {
  max_memory_mb: number;
  max_cpu_ms: number;
  max_concurrent: number;
  timeout_ms: number;
}

export interface PluginConfig {
  id: string;
  risk_level: RiskLevel;
  sandbox_profile: SandboxProfile;
  allowed_roles: string[];
  allowed_federations: string[];
  quotas: PluginQuotas;
  supports_batching: boolean;
}

export interface RuntimeManifest {
  manifest_version: string;
  runtime_identity: RuntimeIdentity;
  security_global_defaults: SecurityDefaults;
  trusted_domains: string[];
  failure_policies: FailurePolicies;
  telemetry_policies: TelemetryPolicies;
  performance_policies: PerformancePolicies;
  plugins: PluginConfig[];
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}
