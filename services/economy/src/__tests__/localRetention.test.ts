import { describe, expect, it } from "vitest";
import { computeLocalRetention } from "../retention";

describe("economy · computeLocalRetention", () => {
  it("retorna 0 cuando no hay flujo", () => {
    expect(computeLocalRetention(0, 0)).toBe(0);
  });

  it("retorna 100 cuando todo el flujo es local", () => {
    expect(computeLocalRetention(1000, 1000)).toBe(100);
  });

  it("retorna valor intermedio proporcional", () => {
    expect(computeLocalRetention(500, 1000)).toBe(50);
  });
});
