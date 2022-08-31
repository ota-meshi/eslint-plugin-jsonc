import { RuleTester } from "eslint";
import rule from "../../../lib/rules/no-nan";

const tester = new RuleTester({
  parser: require.resolve("jsonc-eslint-parser"),
  parserOptions: {
    ecmaVersion: 2020,
  },
});

tester.run("no-nan", rule as any, {
  valid: ["Infinity", "1234", '"foo"', "{NaN:42}"],
  invalid: [
    {
      code: `NaN`,
      errors: ["NaN should not be used."],
    },
    {
      code: `+NaN`,
      errors: ["NaN should not be used."],
    },
    {
      code: `-NaN`,
      errors: ["NaN should not be used."],
    },
  ],
});
