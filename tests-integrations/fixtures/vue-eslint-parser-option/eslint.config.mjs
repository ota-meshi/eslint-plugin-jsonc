import vueParser from "vue-eslint-parser";
import * as jsoncParser from "jsonc-eslint-parser";
import jsonc from "eslint-plugin-jsonc";

export default [
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
