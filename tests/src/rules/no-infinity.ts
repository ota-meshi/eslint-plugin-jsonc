import { RuleTester } from "../test-lib/tester";
import rule from "../../../src/rules/no-infinity";
import * as jsonParser from "jsonc-eslint-parser";

const tester = new RuleTester({
  languageOptions: {
    parser: jsonParser,
    ecmaVersion: 2020,
  },
});

tester.run("no-infinity", rule, {
  valid: ["NaN", "42", '"foo"', "{Infinity:42}"],
  invalid: [
    {
      code: `Infinity`,
      errors: ["Infinity should not be used."],
    },
    {
      code: `+Infinity`,
      errors: ["Infinity should not be used."],
    },
    {
      code: `-Infinity`,
      errors: ["Infinity should not be used."],
    },
  ],
});
