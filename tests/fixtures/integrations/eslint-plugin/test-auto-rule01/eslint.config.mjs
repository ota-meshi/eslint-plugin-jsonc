import * as parser from "jsonc-eslint-parser";

let plugin;
try {
  plugin = await import("../../../../../lib/index.ts");
} catch (e) {
  // @ts-ignore -- ignore
  plugin = await import("../../../../../dist/index.mjs");
}

export default [
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
