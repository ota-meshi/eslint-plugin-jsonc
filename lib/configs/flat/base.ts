import type { ESLint, Linter } from "eslint";
import * as parser from "jsonc-eslint-parser";
export default [
  {
    plugins: {
      get jsonc(): ESLint.Plugin {
        // eslint-disable-next-line @typescript-eslint/no-require-imports -- ignore
        return require("../../index");
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
    languageOptions: {
      parser,
    },
    rules: {
      // ESLint core rules known to cause problems with JSON.
      strict: "off",
      "no-unused-expressions": "off",
      "no-unused-vars": "off",
    },
  },
] satisfies Linter.FlatConfig[];
