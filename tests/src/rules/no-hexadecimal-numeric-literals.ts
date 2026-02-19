import { RuleTester } from "../test-lib/tester";
import rule from "../../../src/rules/no-hexadecimal-numeric-literals";
import * as jsonParser from "jsonc-eslint-parser";

const tester = new RuleTester({
  languageOptions: {
    parser: jsonParser,
    ecmaVersion: 2020,
  },
});

tester.run("no-hexadecimal-numeric-literals", rule, {
  valid: ["0", "777", '"FFF"'],
  invalid: [
    {
      code: `0x777`,
      output: `1911`,
      errors: ["Hexadecimal numeric literals should not be used."],
    },
    {
      code: `0X777`,
      output: `1911`,
      errors: ["Hexadecimal numeric literals should not be used."],
    },
    {
      code: `0xFFFF`,
      output: `65535`,
      errors: ["Hexadecimal numeric literals should not be used."],
    },
  ],
});
