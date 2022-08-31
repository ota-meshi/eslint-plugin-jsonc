import { RuleTester } from "eslint";
import rule from "../../../lib/rules/no-infinity";

const tester = new RuleTester({
  parser: require.resolve("jsonc-eslint-parser"),
  parserOptions: {
    ecmaVersion: 2020,
  },
});

tester.run("no-infinity", rule as any, {
  valid: ["NaN", "42", '"foo"', "{Infinity:42}"],
  invalid: [
    {
      code: `Infinity`,
      errors: ["Infinity should not be used."],
    },
    {
      code: `+Infinity`,
      errors: ["Infinity should not be used."],
    },
    {
      code: `-Infinity`,
      errors: ["Infinity should not be used."],
    },
  ],
});
