import { RuleTester } from "../test-lib/tester.ts";
import rule from "../../../lib/rules/no-octal.ts";
import * as jsonParser from "jsonc-eslint-parser";

const tester = new RuleTester({
  languageOptions: {
    parser: jsonParser,
    ecmaVersion: 2020,
  },
  ignoreMomoa: true,
});

tester.run("no-octal", rule, {
  valid: ["0", "1", "9"],
  invalid: [
    {
      code: `01`,
      errors: ["Octal literals should not be used."],
      ...{
        languageOptions: {
          sourceType: "script",
        },
      },
    },
    {
      code: `09`,
      errors: ["Octal literals should not be used."],
      ...{
        languageOptions: {
          sourceType: "script",
        },
      },
    },
  ],
});
