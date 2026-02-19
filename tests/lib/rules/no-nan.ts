import { RuleTester } from "../test-lib/tester.ts";
import rule from "../../../lib/rules/no-nan.ts";
import * as jsonParser from "jsonc-eslint-parser";

const tester = new RuleTester({
  languageOptions: {
    parser: jsonParser,
    ecmaVersion: 2020,
  },
});

tester.run("no-nan", rule, {
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
