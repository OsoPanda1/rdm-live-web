import { describe, expect, it } from "vitest";
import { guardIsabellaPrompt } from "../isabella-guardian";

describe("ai-core · guardIsabellaPrompt", () => {
  it("permite consultas turísticas normales", () => {
    expect(guardIsabellaPrompt("Recomiéndame una ruta por Real del Monte")).toEqual({ allow: true });
  });

  it("bloquea datos sensibles", () => {
    const decision = guardIsabellaPrompt("Mi contraseña es 1234, ayúdame");
    expect(decision.allow).toBe(false);
    if (decision.allow === false) {
      expect(decision.reason).toBe("SensitiveData");
      expect(decision.safeMessage).toContain("privacidad");
    }
  });
});
