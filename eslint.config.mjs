import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import tseslint from "typescript-eslint";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  ...tseslint.configs.strict,
  {
    rules: {
      "no-console": ["warn", { allow: ["error"] }],
      // Layer rules from ENGINEERING.md section 2: app → features → components/ui, lib.
      "import/no-restricted-paths": [
        "error",
        {
          zones: [
            {
              target: "./src/lib",
              from: ["./src/features", "./src/app", "./src/components"],
              message: "lib/ must not import from features/, app/ or components/.",
            },
            {
              target: "./src/components/ui",
              from: ["./src/features", "./src/app"],
              message: "components/ui must not import from features/ or app/.",
            },
            {
              target: "./src/features",
              from: "./src/app",
              message: "features/ must not import from app/.",
            },
          ],
        },
      ],
    },
  },
  {
    // Features never import other features. Only lib/api may call fetch.
    files: ["src/features/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/*"],
              message:
                "Features must not import other features. Move shared code to lib/ or components/ui.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    ignores: ["src/lib/api/**"],
    rules: {
      "no-restricted-globals": [
        "error",
        { name: "fetch", message: "Only src/lib/api may call fetch. Use the api client." },
      ],
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "playwright-report/**",
    "test-results/**",
  ]),
]);

export default eslintConfig;
