import { RuleTester } from "eslint";
import rule from "../../../lib/rules/no-binary-numeric-literals";

const tester = new RuleTester({
  parser: require.resolve("jsonc-eslint-parser"),
  parserOptions: {
    ecmaVersion: 2020,
  },
});

tester.run("no-binary-numeric-literals", rule as any, {
  valid: ["0", "1010"],
  invalid: [
    {
      code: `0b1010`,
      output: `10`,
      errors: ["Binary numeric literals should not be used."],
    },
    {
      code: `0B1010`,
      output: `10`,
      errors: ["Binary numeric literals should not be used."],
    },
  ],
});
