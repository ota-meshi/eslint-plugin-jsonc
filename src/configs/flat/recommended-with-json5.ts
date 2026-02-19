// IMPORTANT!
// This file has been automatically generated,
// in order to update its content execute "npm run update"
import type { Linter } from "eslint";
import base from "./base";
export default [
  ...base,
  {
    rules: {
      // eslint-plugin-jsonc rules
      "jsonc/no-bigint-literals": "error",
      "jsonc/no-binary-expression": "error",
      "jsonc/no-binary-numeric-literals": "error",
      "jsonc/no-dupe-keys": "error",
      "jsonc/no-escape-sequence-in-identifier": "error",
      "jsonc/no-number-props": "error",
      "jsonc/no-numeric-separators": "error",
      "jsonc/no-octal-numeric-literals": "error",
      "jsonc/no-octal": "error",
      "jsonc/no-parenthesized": "error",
      "jsonc/no-regexp-literals": "error",
      "jsonc/no-sparse-arrays": "error",
      "jsonc/no-template-literals": "error",
      "jsonc/no-undefined-value": "error",
      "jsonc/no-unicode-codepoint-escapes": "error",
      "jsonc/no-useless-escape": "error",
      "jsonc/space-unary-ops": "error",
      "jsonc/vue-custom-block/no-parsing-error": "error",
    },
  },
] satisfies Linter.FlatConfig[];
