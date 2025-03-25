import { RuleTester } from "../test-lib/tester";
import rule from "../../../lib/rules/no-escape-sequence-in-identifier";
import * as jsonParser from "jsonc-eslint-parser";

const tester = new RuleTester({
  languageOptions: {
    parser: jsonParser,
    ecmaVersion: 2020,
  },
  ignoreMomoa: true,
});

tester.run("no-escape-sequence-in-identifier", rule, {
  valid: ["{key: 42}"],
  invalid: [
    {
      code: `{\\u0041_\\u{42}: "\\u0043\\u{44}"}`,
      output: `{A_B: "\\u0043\\u{44}"}`,
      errors: [
        {
          message: "Escape sequence in identifiers should not be used.",
          line: 1,
          column: 2,
        },
        {
          message: "Escape sequence in identifiers should not be used.",
          line: 1,
          column: 9,
        },
      ],
    },
  ],
});
