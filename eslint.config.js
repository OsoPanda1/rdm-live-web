import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist", "coverage", "playwright-report", "node_modules"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
      // Centralized logger required. Any direct console.* fails CI.
      // Exceptions: see overrides below for logger module, env bootstrap, tests and node instrumentation.
      "no-console": "error",
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/*.server", "**/*.server.ts", "**/integrations/supabase/admin.server*"],
              message:
                "Server-only module. Do not import from frontend code. Use it from Edge Functions or *.server.ts files only.",
            },
            {
              group: ["**/integrations/supabase/admin", "**/integrations/supabase/admin.ts"],
              message:
                "Deprecated. Use getSupabaseAdmin() from 'admin.server' in server code only.",
            },
          ],
        },
      ],
    },
  },
  // Server-only files: relax the server-import restriction and allow process.env.
  {
    files: [
      "**/*.server.ts",
      "**/*.server.tsx",
      "services/**/*.{ts,tsx}",
      "supabase/functions/**/*.{ts,tsx}",
      "infra/**/*.{ts,tsx}",
      "scripts/**/*.{ts,tsx}",
    ],
    rules: {
      "no-restricted-imports": "off",
      "no-console": "off",
    },
  },
  // Allowed console.* sinks (the logger itself, env bootstrap, low-level instrumentation, tests).
  {
    files: [
      "src/lib/logger.ts",
      "src/lib/env.ts",
      "src/core/audit/logger.ts",
      "src/instrumentation.node.ts",
      "src/test/**/*.{ts,tsx}",
      "e2e/**/*.{ts,tsx}",
      "tests/**/*.{ts,tsx}",
    ],
    rules: { "no-console": "off" },
  },
  // Config files that use require()
  {
    files: ["tailwind.config.ts"],
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
  // Data / imported files — static data, not core logic
  {
    files: ["src/data/**/*.{ts,tsx}", "apps/**/src/data/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "no-console": "off",
    },
  },
  // Auto-generated Supabase types
  {
    files: ["src/integrations/supabase/types.ts"],
    rules: {
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-empty-object-type": "off",
    },
  },
  // Apps directories (admin, web) — relaxed typing
  {
    files: ["apps/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  // API client / hooks / generated code — generic data fetching
  {
    files: ["src/lib/api.ts", "src/lib/apiClient.ts", "src/lib/hooks.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
  // Legacy component files with inherited @ts-nocheck — migrate gradually
  {
    files: [
      "src/components/DashboardView.tsx",
      "src/components/DichosSection.tsx",
      "src/components/ExplorerView.tsx",
      "src/components/Footer.tsx",
      "src/components/InteractiveMap.tsx",
      "src/components/MapSection.tsx",
      "src/components/MerchantCatalog.tsx",
      "src/components/NotificationSystem.tsx",
      "src/components/RealitoOrb.tsx",
      "src/components/ReviewPrompt.tsx",
      "src/components/TerritorialMap.tsx",
      "src/components/TourismInnovationSection.tsx",
      "src/components/business/BusinessCard.tsx",
      "src/components/home/IsabellaOrb.tsx",
      "src/components/isabella/IsabellaChat.tsx",
      "src/components/metaverse/RetractableToolbar.tsx",
      "src/components/metaverse/TAMVTrixField.tsx",
      "src/components/rdm/RDMInteractiveMap.tsx",
      "src/contexts/VisualContext.tsx",
      "src/features/search/tourismIndex.ts",
      "src/pages/AtlasMaximus.tsx",
      "src/pages/EcosistemaLTOS.tsx",
      "src/pages/GraciasDonativo.tsx",
      "src/pages/MetaverseHome.tsx",
      "src/pages/Rutas.tsx",
    ],
    rules: {
      "@typescript-eslint/ban-ts-comment": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
);
