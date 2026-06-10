import { afterEach, describe, expect, it } from "vitest";
import { clearAiProviderForTests, getAiProvider, registerAiProvider } from "../index";

const provider = {
  name: "test-provider",
  complete: async () => ({ text: "ok" }),
};

describe("infra · ai-provider registry", () => {
  afterEach(() => clearAiProviderForTests());

  it("requiere registrar proveedor", () => {
    expect(() => getAiProvider()).toThrow("No AI provider registered");
  });

  it("retorna el proveedor registrado", () => {
    registerAiProvider(provider);
    expect(getAiProvider().name).toBe("test-provider");
  });
});
