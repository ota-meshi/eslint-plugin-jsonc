import { RuleTester } from "../test-lib/eslint-compat";
import rule from "../../../lib/rules/no-octal";
import * as jsonParser from "jsonc-eslint-parser";

const tester = new RuleTester({
  languageOptions: {
    parser: jsonParser,
    ecmaVersion: 2020,
  },
});

tester.run("no-octal", rule as any, {
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
