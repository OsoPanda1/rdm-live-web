import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30000,
  retries: 1,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:8080",
    headless: true,
  },
  webServer: {
    command: "npm run build && npm run preview",
    port: 8080,
    reuseExistingServer: !process.env.CI,
  },
});
