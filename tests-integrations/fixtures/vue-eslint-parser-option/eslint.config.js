const vueParser = require("vue-eslint-parser");
const jsoncParser = require("jsonc-eslint-parser");
const jsonc = require("eslint-plugin-jsonc");

module.exports = [
  {
    files: ["**/*.json"],
    plugins: {
      jsonc,
    },
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: jsoncParser,
        sourceType: "module",
        ecmaVersion: 2015,
      },
    },
    rules: {
      "jsonc/indent": "error",
    },
  },
];
