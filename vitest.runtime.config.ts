import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["runtime/test/unit/**/*.test.ts"],
    environment: "node",
  },
});
