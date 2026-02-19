import { RuleTester } from "../test-lib/tester.ts";
import rule from "../../../lib/rules/no-plus-sign.ts";
import * as jsonParser from "jsonc-eslint-parser";

const tester = new RuleTester({
  languageOptions: {
    parser: jsonParser,
    ecmaVersion: 2020,
  },
});

tester.run("no-plus-sign", rule, {
  valid: ["42", "-42", "-42.0"],
  invalid: [
    {
      code: `+42`,
      output: `42`,
      errors: ["Plus sign should not be used."],
    },
    {
      code: `+ 42`,
      output: ` 42`,
      errors: ["Plus sign should not be used."],
      ignoreMomoa: true,
    },
  ],
});
