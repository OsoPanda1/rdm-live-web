import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import tsconfigPaths from "vite-tsconfig-paths"

export default defineConfig({
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/three") || id.includes("node_modules/@react-three"))
            return "three-vendor"
          if (id.includes("node_modules/framer-motion")) return "framer-vendor"
          if (
            id.includes("node_modules/leaflet") ||
            id.includes("node_modules/react-leaflet") ||
            id.includes("node_modules/supercluster")
          )
            return "leaflet-vendor"
          if (
            id.includes("node_modules/react") ||
            id.includes("node_modules/react-dom") ||
            id.includes("node_modules/react-router")
          )
            return "react-vendor"
          if (id.includes("node_modules/@radix-ui")) return "radix-vendor"
        },
      },
    },
  },
})
