import { RuleTester } from "../test-lib/tester";
import rule from "../../../lib/rules/no-nan";
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
