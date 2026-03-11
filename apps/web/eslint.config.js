import eslintPluginAstro from "eslint-plugin-astro";
import jsxA11y from "eslint-plugin-jsx-a11y";
import tsParser from "@typescript-eslint/parser";

export default [
  // ── Astro files ──────────────────────────────────────────────────────────
  // Includes: astro/recommended rules + TypeScript parser for the frontmatter
  ...eslintPluginAstro.configs.recommended,

  // ── TypeScript / TSX files ───────────────────────────────────────────────
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./tsconfig.json",
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      "jsx-a11y": jsxA11y,
    },
    rules: {
      ...jsxA11y.flatConfigs.recommended.rules,
    },
  },

  // ── Project-wide overrides ───────────────────────────────────────────────
  {
    rules: {
      // Prevent accidental use of the set:html directive (XSS risk)
      "astro/no-set-html-directive": "warn",
    },
  },

  // ── Ignore generated / build output ─────────────────────────────────────
  {
    ignores: ["dist/**", ".astro/**", "node_modules/**"],
  },
];