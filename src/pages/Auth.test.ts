import { describe, it, expect } from "vitest";
import { z } from "zod";

// Mirror of schemas defined in src/pages/Auth.tsx — kept in lockstep with the route.
const signupSchema = z.object({
  displayName: z.string().trim().min(2).max(60),
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(128),
});

const loginSchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(1),
});

describe("auth form schemas", () => {
  it("rejects short displayName", () => {
    const r = signupSchema.safeParse({ displayName: "a", email: "a@b.co", password: "12345678" });
    expect(r.success).toBe(false);
  });
  it("rejects invalid email", () => {
    const r = loginSchema.safeParse({ email: "not-an-email", password: "x" });
    expect(r.success).toBe(false);
  });
  it("rejects passwords shorter than 8 on signup", () => {
    const r = signupSchema.safeParse({ displayName: "Ana", email: "a@b.co", password: "1234567" });
    expect(r.success).toBe(false);
  });
  it("accepts a valid signup payload", () => {
    const r = signupSchema.safeParse({
      displayName: "Ana López",
      email: "ana@real.mx",
      password: "supersegura",
    });
    expect(r.success).toBe(true);
  });
  it("accepts a valid login payload", () => {
    const r = loginSchema.safeParse({ email: "ana@real.mx", password: "x" });
    expect(r.success).toBe(true);
  });
});
