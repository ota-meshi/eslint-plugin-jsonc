let plugin;
try {
  plugin = require("../../../../../lib/index");
} catch (e) {
  plugin = require("../../../../../dist/index");
}
const parser = require("jsonc-eslint-parser");

module.exports = [
  {
    plugins: {
      jsonc: plugin,
    },
    rules: {
      indent: "error",
      "no-unused-vars": "off",
      "no-multi-spaces": "error",
      "no-multiple-empty-lines": "error",
      "jsonc/auto": "error",
      "jsonc/no-comments": "error",
    },
  },
  {
    files: ["**/*.json"],
    languageOptions: {
      parser,
    },
  },
];
