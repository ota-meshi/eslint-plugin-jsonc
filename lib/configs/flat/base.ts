import type { ESLint, Linter } from "eslint";
import plugin from "../../index.ts";

export default [
  {
    plugins: {
      get jsonc(): ESLint.Plugin {
        return plugin;
      },
    },
  },
  {
    files: [
      "*.json",
      "**/*.json",
      "*.json5",
      "**/*.json5",
      "*.jsonc",
      "**/*.jsonc",
    ],
    language: "jsonc/x",
    rules: {
      // ESLint core rules known to cause problems with JSON.
      strict: "off",
      "no-unused-expressions": "off",
      "no-unused-vars": "off",
    },
  },
] satisfies Linter.Config[];
