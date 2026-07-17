import { describe, it, expect } from "vitest";
import { secureRandomInt, secureRandomFloat, secureRandomId, secureRandomHex } from "../secure-random";

describe("secure-random", () => {
  it("secureRandomInt is bounded", () => {
    for (let i = 0; i < 1000; i++) {
      const n = secureRandomInt(10);
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThan(10);
    }
  });

  it("secureRandomFloat in [0,1)", () => {
    for (let i = 0; i < 1000; i++) {
      const n = secureRandomFloat();
      expect(n).toBeGreaterThanOrEqual(0);
      expect(n).toBeLessThan(1);
    }
  });

  it("secureRandomId is URL-safe and non-empty", () => {
    const id = secureRandomId(16);
    expect(id).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(id.length).toBeGreaterThan(10);
  });

  it("secureRandomHex has expected length", () => {
    expect(secureRandomHex(8)).toHaveLength(16);
  });

  it("produces distinct ids (collision check)", () => {
    const ids = new Set(Array.from({ length: 10_000 }, () => secureRandomId(16)));
    expect(ids.size).toBe(10_000);
  });
});
