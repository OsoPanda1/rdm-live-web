import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils";

describe("cn (tailwind-merge)", () => {
  it("merges class strings and removes duplicates", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });
  it("filters falsy values", () => {
    // eslint-disable-next-line no-constant-binary-expression
    expect(cn("a", false && "b", undefined, "c")).toBe("a c");
  });
});
