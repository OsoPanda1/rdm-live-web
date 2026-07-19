import { describe, it, expect } from "vitest";
import { validateIdentity, validateExecution, decodeToken } from "../../src/security/validator.js";
import { SessionManager } from "../../src/session/manager.js";

function createSessionManager(): SessionManager {
  return new SessionManager({
    ttlMs: 300000,
    maxSessions: 1000,
    signingKey: Buffer.from("test-key-32-chars-for-hmac!!", "utf-8"),
  });
}

describe("Security Validator", () => {
  describe("validateIdentity", () => {
    it("rejects missing auth and session", () => {
      const sm = createSessionManager();
      const result = validateIdentity(null, null, sm);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Missing authorization");
    });

    it("rejects invalid auth scheme", () => {
      const sm = createSessionManager();
      const result = validateIdentity("Basic xyz", null, sm);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("Invalid authorization scheme");
    });

    it("accepts valid session ticket", () => {
      const sm = createSessionManager();
      const ticket = sm.issue({
        subjectId: "user-1",
        federationId: "DEKATEOTL",
        roles: ["admin"],
        riskLevel: "LOW",
      });
      const result = validateIdentity(null, ticket.sessionId, sm);
      expect(result.valid).toBe(true);
      expect(result.context?.sessionCached).toBe(true);
      expect(result.context?.subjectId).toBe("user-1");
    });

    it("rejects with token that has no auth header even with session", () => {
      const sm = createSessionManager();
      const result = validateIdentity("Bearer invalid.token.here", null, sm);
      expect(result.valid).toBe(false);
    });
  });

  describe("validateExecution", () => {
    const plugin = {
      id: "test-plugin",
      risk_level: "HIGH" as const,
      sandbox_profile: "WASM_SECCOMP" as const,
      allowed_roles: ["admin", "operator"],
      allowed_federations: ["DEKATEOTL", "ANUBIS"],
      quotas: { max_memory_mb: 128, max_cpu_ms: 500, max_concurrent: 5, timeout_ms: 10000 },
      supports_batching: false,
    };

    it("allows valid role and federation", () => {
      const result = validateExecution(plugin, {
        authenticated: true,
        roles: ["admin"],
        federationId: "DEKATEOTL",
        riskLevel: "LOW",
        sessionCached: true,
      });
      expect(result.allowed).toBe(true);
      expect(result.sandboxProfile).toBe("WASM_SECCOMP");
    });

    it("denies unauthenticated", () => {
      const result = validateExecution(plugin, {
        authenticated: false,
        roles: [],
        riskLevel: "LOW",
        sessionCached: false,
      });
      expect(result.allowed).toBe(false);
    });

    it("denies wrong federation", () => {
      const result = validateExecution(plugin, {
        authenticated: true,
        roles: ["admin"],
        federationId: "PHOENIX",
        riskLevel: "LOW",
        sessionCached: false,
      });
      expect(result.allowed).toBe(false);
    });

    it("denies insufficient role", () => {
      const result = validateExecution(plugin, {
        authenticated: true,
        roles: ["viewer"],
        federationId: "DEKATEOTL",
        riskLevel: "LOW",
        sessionCached: false,
      });
      expect(result.allowed).toBe(false);
    });

    it("allows wildcard federation", () => {
      const wildPlugin = { ...plugin, allowed_federations: ["*"] };
      const result = validateExecution(wildPlugin, {
        authenticated: true,
        roles: ["admin"],
        federationId: "ANY",
        riskLevel: "LOW",
        sessionCached: false,
      });
      expect(result.allowed).toBe(true);
    });

    it("allows wildcard role", () => {
      const wildPlugin = { ...plugin, allowed_roles: ["*"] };
      const result = validateExecution(wildPlugin, {
        authenticated: true,
        roles: ["any_role"],
        federationId: "DEKATEOTL",
        riskLevel: "LOW",
        sessionCached: false,
      });
      expect(result.allowed).toBe(true);
    });
  });

  describe("decodeToken", () => {
    function createToken(payload: Record<string, unknown>): string {
      const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
      const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
      const sig = Buffer.from("fake-signature").toString("base64url");
      return `${header}.${body}.${sig}`;
    }

    it("decodes JWT payload", () => {
      const token = createToken({ sub: "user-1", role: "admin", exp: 9999999999 });
      const payload = decodeToken(token);
      expect(payload.sub).toBe("user-1");
      expect(payload.role).toBe("admin");
    });
  });
});
