import { RuleTester } from "../test-lib/tester";
import rule from "../../../lib/rules/no-floating-decimal";
import * as jsonParser from "jsonc-eslint-parser";

const tester = new RuleTester({
  languageOptions: {
    parser: jsonParser,
    ecmaVersion: 2020,
  },
});

tester.run("no-floating-decimal", rule, {
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
