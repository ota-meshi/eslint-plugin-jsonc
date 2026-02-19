import { RuleTester } from "../test-lib/tester";
import rule from "../../../src/rules/no-octal";
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
      ...({
        languageOptions: {
          sourceType: "script",
        },
      } as any),
    },
    {
      code: `09`,
      errors: ["Octal literals should not be used."],
      ...({
        languageOptions: {
          sourceType: "script",
        },
      } as any),
    },
  ],
});
