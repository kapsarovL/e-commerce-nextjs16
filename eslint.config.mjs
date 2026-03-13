import { fixupConfigRules, fixupPluginRules, FlatCompat } from "@eslint/compat";
import reactCompiler from "eslint-plugin-react-compiler";
import reactHooks from "eslint-plugin-react-hooks";
import sortKeysFix from "eslint-plugin-sort-keys-fix";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import globals from "globals";
import js from "@eslint/js";
import tseslint from "typescript-eslint";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  allConfig: js.configs.all,
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

const eslintConfig = [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...fixupConfigRules(
    compat.extends(
      "eslint-config-prettier",
      "next",
      "next/core-web-vitals",
    ),
  ),
  {
    languageOptions: {
      ecmaVersion: 12,
      globals: {
        ...globals.browser,
      },
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        sourceType: "module",
      },
    },
    plugins: {
      "react-compiler": reactCompiler,
      "react-hooks": fixupPluginRules(reactHooks),
      "sort-keys-fix": sortKeysFix,
    },
    rules: {
      "react-compiler/react-compiler": "error",
      "sort-keys-fix/sort-keys-fix": "warn",
    },
  },
];

export default eslintConfig;
