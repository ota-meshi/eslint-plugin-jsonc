import markdown from "eslint-plugin-markdown";
import jsonc from "eslint-plugin-jsonc";

export default [
  ...markdown.configs.recommended,
  ...jsonc.configs["flat/recommended-with-json"],
  {
    rules: {
      "array-bracket-newline": "error",
      "jsonc/auto": "error",
    },
  },
];
