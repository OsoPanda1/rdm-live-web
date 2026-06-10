import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@geo-engine": path.resolve(__dirname, "./packages/geo-engine/src"),
      "@core-kernel": path.resolve(__dirname, "./packages/core-kernel/src"),
      "@data-models": path.resolve(__dirname, "./packages/data-models/src"),
      "@ui-kit": path.resolve(__dirname, "./packages/ui-kit/src"),
      "@ai-core": path.resolve(__dirname, "./services/ai-core/src"),
      "@twin": path.resolve(__dirname, "./services/territorial-twin/src"),
      "@economy": path.resolve(__dirname, "./services/economy/src"),
      "@analytics": path.resolve(__dirname, "./services/analytics/src"),
      "@culture": path.resolve(__dirname, "./services/culture/src"),
      "@app-web": path.resolve(__dirname, "./apps/web/src"),
      "@app-admin": path.resolve(__dirname, "./apps/admin/src"),
      "@infra/ai-provider": path.resolve(__dirname, "./infra/ai-provider/src"),
      "@territorial-sensing": path.resolve(__dirname, "./services/territorial-sensing/src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
  },
}));
