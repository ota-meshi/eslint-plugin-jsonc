import { RuleTester } from "eslint";
import rule from "../../../lib/rules/no-floating-decimal";

const tester = new RuleTester({
  parser: require.resolve("jsonc-eslint-parser"),
  parserOptions: {
    ecmaVersion: 2020,
  },
});

tester.run("no-floating-decimal", rule as any, {
  valid: ["42", "42.0", "0.42"],
  invalid: [
    {
      code: `.42`,
      output: `0.42`,
      errors: ["A leading decimal point can be confused with a dot."],
    },
    {
      code: `42.`,
      output: `42.0`,
      errors: ["A trailing decimal point can be confused with a dot."],
    },
  ],
});
