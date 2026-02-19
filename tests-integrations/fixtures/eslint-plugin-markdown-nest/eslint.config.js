const markdown = require("eslint-plugin-markdown");
const jsonc = require("eslint-plugin-jsonc");

module.exports = [
  ...markdown.configs.recommended,
  {
    rules: {
      quotes: ["error", "single"],
    },
  },
  ...jsonc.configs["recommended-with-json"],
  {
    files: ["*.json"],
    rules: {
      "jsonc/auto": "error",
    },
  },
];
