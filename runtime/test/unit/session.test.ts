import { describe, it, expect, beforeEach } from "vitest";
import { SessionManager, SessionError } from "../../src/session/manager.js";

describe("SessionManager", () => {
  let manager: SessionManager;

  beforeEach(() => {
    manager = new SessionManager({
      ttlMs: 10000,
      maxSessions: 100,
      signingKey: Buffer.from("test-key-test-key-test-key-test-key!", "utf-8"),
    });
  });

  it("issues a session ticket", () => {
    const ticket = manager.issue({
      subjectId: "user-1",
      federationId: "DEKATEOTL",
      roles: ["admin"],
      riskLevel: "LOW",
    });

    expect(ticket.sessionId).toBeDefined();
    expect(ticket.subjectId).toBe("user-1");
    expect(ticket.federationId).toBe("DEKATEOTL");
    expect(ticket.roles).toEqual(["admin"]);
    expect(ticket.signature).toBeDefined();
    expect(ticket.signature.length).toBeGreaterThan(0);
  });

  it("validates a valid ticket", () => {
    const ticket = manager.issue({
      subjectId: "user-1",
      federationId: "DEKATEOTL",
      roles: ["viewer"],
      riskLevel: "LOW",
    });

    const validated = manager.validate(ticket.sessionId);
    expect(validated.subjectId).toBe("user-1");
  });

  it("rejects unknown session id", () => {
    expect(() => manager.validate("nonexistent")).toThrow(SessionError);
  });

  it("rejects expired ticket", async () => {
    const shortManager = new SessionManager({
      ttlMs: 1,
      maxSessions: 100,
      signingKey: Buffer.from("test-key-test-key-test-key-test-key!", "utf-8"),
    });

    const ticket = shortManager.issue({
      subjectId: "user-1",
      federationId: "TEST",
      roles: [],
      riskLevel: "LOW",
    });

    await new Promise((r) => setTimeout(r, 10));
    expect(() => shortManager.validate(ticket.sessionId)).toThrow(SessionError);
  });

  it("revokes single session", () => {
    const ticket = manager.issue({
      subjectId: "user-1",
      federationId: "TEST",
      roles: [],
      riskLevel: "LOW",
    });

    manager.revokeSession(ticket.sessionId);
    expect(() => manager.validate(ticket.sessionId)).toThrow(SessionError);
  });

  it("revokes all sessions for a subject", () => {
    const t1 = manager.issue({ subjectId: "user-1", federationId: "TEST", roles: [], riskLevel: "LOW" });
    const t2 = manager.issue({ subjectId: "user-1", federationId: "TEST", roles: [], riskLevel: "LOW" });

    manager.revokeSubject("user-1");
    expect(() => manager.validate(t1.sessionId)).toThrow(SessionError);
    expect(() => manager.validate(t2.sessionId)).toThrow(SessionError);
  });

  it("rejects when capacity reached", () => {
    const small = new SessionManager({
      ttlMs: 10000,
      maxSessions: 2,
      signingKey: Buffer.from("test", "utf-8"),
    });

    small.issue({ subjectId: "a", federationId: "T", roles: [], riskLevel: "LOW" });
    small.issue({ subjectId: "b", federationId: "T", roles: [], riskLevel: "LOW" });
    expect(() => small.issue({ subjectId: "c", federationId: "T", roles: [], riskLevel: "LOW" })).toThrow(SessionError);
  });
});
