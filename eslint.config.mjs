import { fixupConfigRules, fixupPluginRules } from "@eslint/compat";
import autofix from "eslint-plugin-autofix";
import reactCompiler from "eslint-plugin-react-compiler";
import reactHooks from "eslint-plugin-react-hooks";
import sortKeysFix from "eslint-plugin-sort-keys-fix";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import globals from "globals";
import compat from "@eslint/compat";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  allConfig: js.configs.all,
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

const eslintConfig = [
    { files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"], plugins: { js }, extends: ["js/recommended"], languageOptions: { globals: globals.browser } },
  tseslint.configs.recommended,
    pluginReact.configs.flat.recommended,
  {
    
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    ignores: ["**/next-env.d.ts"],
  },
  ...fixupConfigRules(
    compat.extends(
      "eslint:recommended",
      "eslint-config-prettier",
      "plugin:react/recommended",
      "plugin:@typescript-eslint/recommended",
      "plugin:import/recommended",
      "plugin:jsx-a11y/recommended",
      "next",
      "next/core-web-vitals",
      "prettier",
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
      autofix,
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
