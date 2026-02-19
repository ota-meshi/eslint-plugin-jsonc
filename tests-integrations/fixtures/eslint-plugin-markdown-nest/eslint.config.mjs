import markdown from "eslint-plugin-markdown";
import jsonc from "eslint-plugin-jsonc";

export default [
  ...markdown.configs.recommended,
  {
    rules: {
      quotes: ["error", "single"],
    },
  },
  ...jsonc.configs["flat/recommended-with-json"],
  {
    files: ["*.json"],
    rules: {
      "jsonc/auto": "error",
    },
  },
];
