import { describe, it, expect } from "vitest";
import { clientEnv, isProd, isDev } from "@/lib/env";

describe("env", () => {
  it("exposes a parsed clientEnv with safe defaults", () => {
    expect(clientEnv).toBeTypeOf("object");
    expect(["development", "preview", "production"]).toContain(clientEnv.VITE_APP_ENV);
  });

  it("isProd / isDev are mutually consistent with VITE_APP_ENV", () => {
    if (clientEnv.VITE_APP_ENV === "production") {
      expect(isProd).toBe(true);
      expect(isDev).toBe(false);
    } else if (clientEnv.VITE_APP_ENV === "development") {
      expect(isProd).toBe(false);
      expect(isDev).toBe(true);
    }
  });
});
