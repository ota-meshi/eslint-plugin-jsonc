import { RuleTester } from "../test-lib/tester.ts";
import rule from "../../../lib/rules/no-binary-numeric-literals.ts";
import * as jsonParser from "jsonc-eslint-parser";

const tester = new RuleTester({
  languageOptions: {
    parser: jsonParser,
    ecmaVersion: 2020,
  },
  ignoreMomoa: true,
});

tester.run("no-binary-numeric-literals", rule, {
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
