import { RuleTester } from "../test-lib/tester";
import rule from "../../../lib/rules/no-octal-numeric-literals";
import * as jsonParser from "jsonc-eslint-parser";

const tester = new RuleTester({
  languageOptions: {
    parser: jsonParser,
    ecmaVersion: 2020,
  },
  ignoreMomoa: true,
});

tester.run("no-octal-numeric-literals", rule as any, {
  valid: ["0", "777"],
  invalid: [
    {
      code: `0o777`,
      output: `511`,
      errors: ["Octal numeric literals should not be used."],
    },
    {
      code: `0O777`,
      output: `511`,
      errors: ["Octal numeric literals should not be used."],
    },
  ],
});
