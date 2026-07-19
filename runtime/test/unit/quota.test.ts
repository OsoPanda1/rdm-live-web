import { describe, it, expect, beforeEach } from "vitest";
import { QuotaManager, QuotaExceededError } from "../../src/quota/manager.js";

describe("QuotaManager", () => {
  let qm: QuotaManager;

  beforeEach(() => {
    qm = new QuotaManager();
  });

  it("allows concurrent within limit", () => {
    const plugin = {
      id: "test",
      risk_level: "LOW" as const,
      sandbox_profile: "WASM_DEFAULT" as const,
      allowed_roles: ["*"],
      allowed_federations: ["*"],
      quotas: { max_memory_mb: 64, max_cpu_ms: 200, max_concurrent: 5, timeout_ms: 5000 },
      supports_batching: false,
    };

    for (let i = 0; i < 5; i++) {
      expect(() => qm.checkConcurrent("test", plugin)).not.toThrow();
    }
  });

  it("rejects exceeding concurrent limit", () => {
    const plugin = {
      id: "test",
      risk_level: "LOW" as const,
      sandbox_profile: "WASM_DEFAULT" as const,
      allowed_roles: ["*"],
      allowed_federations: ["*"],
      quotas: { max_memory_mb: 64, max_cpu_ms: 200, max_concurrent: 2, timeout_ms: 5000 },
      supports_batching: false,
    };

    qm.checkConcurrent("test", plugin);
    qm.checkConcurrent("test", plugin);
    expect(() => qm.checkConcurrent("test", plugin)).toThrow(QuotaExceededError);
  });

  it("releases concurrent slot", () => {
    const plugin = {
      id: "test",
      risk_level: "LOW" as const,
      sandbox_profile: "WASM_DEFAULT" as const,
      allowed_roles: ["*"],
      allowed_federations: ["*"],
      quotas: { max_memory_mb: 64, max_cpu_ms: 200, max_concurrent: 1, timeout_ms: 5000 },
      supports_batching: false,
    };

    qm.checkConcurrent("test", plugin);
    qm.releaseConcurrent("test");
    expect(() => qm.checkConcurrent("test", plugin)).not.toThrow();
  });
});
