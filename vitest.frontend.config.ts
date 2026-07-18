import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: [
      "src/features/**/*.test.ts",
      "src/lib/validation/**/*.test.ts",
      "src/hooks/useTimeTheme.test.ts",
      "src/features/twins/hybridTwin.test.ts",
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
