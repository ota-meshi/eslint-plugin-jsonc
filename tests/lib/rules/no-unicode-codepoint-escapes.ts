import { RuleTester } from "../test-lib/tester";
import rule from "../../../lib/rules/no-unicode-codepoint-escapes";
import * as jsonParser from "jsonc-eslint-parser";

const tester = new RuleTester({
  languageOptions: {
    parser: jsonParser,
    ecmaVersion: 2020,
  },
  ignoreMomoa: true,
});

tester.run("no-unicode-codepoint-escapes", rule as any, {
  valid: ['"\\u0041"', '{"\\u0041": "string"}', "`\\u0042`"],
  invalid: [
    {
      code: `"\\u{41}"`,
      output: `"\\u0041"`,
      errors: ["Unicode code point escape sequence should not be used."],
    },
    {
      code: `{"\\u{41}": "string"}`,
      output: `{"\\u0041": "string"}`,
      errors: ["Unicode code point escape sequence should not be used."],
    },
    {
      code: `{a\\u{41}: "string"}`,
      output: `{a\\u0041: "string"}`,
      errors: ["Unicode code point escape sequence should not be used."],
    },
    {
      code: "`\\u{42}`",
      output: "`\\u0042`",
      errors: ["Unicode code point escape sequence should not be used."],
    },
    {
      code: '"\\u{20BB7}"',
      output: '"\\uD842\\uDFB7"',
      errors: ["Unicode code point escape sequence should not be used."],
    },
  ],
});
