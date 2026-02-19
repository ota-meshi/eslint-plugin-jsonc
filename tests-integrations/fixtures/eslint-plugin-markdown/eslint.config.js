const markdown = require("eslint-plugin-markdown");
const jsonc = require("eslint-plugin-jsonc");

module.exports = [
  ...markdown.configs.recommended,
  ...jsonc.configs["recommended-with-json"],
  {
    rules: {
      "array-bracket-newline": "error",
      "jsonc/auto": "error",
    },
  },
];
