import { describe, it, expect } from "vitest";
import { validateManifest } from "../../src/manifest/loader.js";

describe("Manifest Loader", () => {
  it("rejects null manifest", () => {
    const result = validateManifest(null);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Manifest must be a JSON object");
  });

  it("rejects manifest missing required sections", () => {
    const result = validateManifest({ manifest_version: "1.0" });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("validates complete manifest", () => {
    const result = validateManifest({
      manifest_version: "1.0.0",
      runtime_identity: { node_id: "test", federation: "TEST", version: "1", boot_timestamp: "" },
      security_global_defaults: {
        zero_trust_level: "STRICT",
        deny_by_default_on_ambiguity: true,
        allow_dynamic_loading: false,
        token_validation: { enabled: true, min_key_strength: "PQC_LEVEL3", session_ttl_seconds: 300 },
        cors: { allowed_origins: ["*"], allow_credentials: false },
      },
      trusted_domains: ["test.com"],
      failure_policies: {
        on_exceeded_quota: "REJECT_REQUEST",
        on_sandbox_crash: "RESTART_INSTANCE",
        on_network_timeout: "RETRY_UPSTREAM",
        max_retries: 3,
        circuit_breaker: { enabled: true, failure_threshold: 10, recovery_timeout_ms: 30000 },
      },
      telemetry_policies: {
        metrics_enabled: true,
        logs_enabled: true,
        traces_enabled: true,
        sampling_rate: 0.1,
        redact_fields: [],
        exporters: { prometheus: { endpoint: "/metrics", enabled: true }, otel_grpc: { endpoint: "", enabled: false } },
      },
      performance_policies: {
        max_concurrent_invokes: 100,
        max_batch_window_ms: 10,
        max_batch_size: 50,
        enable_batching: true,
        session_cache_ttl_seconds: 300,
        wasm_pool: { min_warm_instances: 2, max_instances: 10, idle_timeout_seconds: 60, max_concurrent_per_plugin: 5 },
      },
      plugins: [
        {
          id: "test-plugin",
          risk_level: "LOW",
          sandbox_profile: "WASM_DEFAULT",
          allowed_roles: ["admin"],
          allowed_federations: ["*"],
          quotas: { max_memory_mb: 64, max_cpu_ms: 200, max_concurrent: 5, timeout_ms: 5000 },
          supports_batching: false,
        },
      ],
    });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});
