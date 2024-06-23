import base from "./eslint.config.mjs";
import eslintRuleTester from "eslint-plugin-eslint-rule-tester";

export default [
  ...base,
  {
    files: ["tests/src/rules/**/*.ts"],
    plugins: { "eslint-rule-tester": eslintRuleTester },
    rules: {
      "eslint-rule-tester/valid-testcase": "error",
    },
  },
];
