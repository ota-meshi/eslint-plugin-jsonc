import { RuleTester } from "eslint";
import rule from "../../../lib/rules/no-unicode-codepoint-escapes";

const tester = new RuleTester({
  parser: require.resolve("jsonc-eslint-parser"),
  parserOptions: {
    ecmaVersion: 2020,
  },
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
