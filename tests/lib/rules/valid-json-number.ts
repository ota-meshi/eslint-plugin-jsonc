import { RuleTester } from "../test-lib/tester.ts";
import rule from "../../../lib/rules/valid-json-number.ts";
import * as jsonParser from "jsonc-eslint-parser";
import * as vueParser from "vue-eslint-parser";

const tester = new RuleTester({
  languageOptions: {
    parser: jsonParser,
    ecmaVersion: 2020,
  },
});

tester.run("valid-json-number", rule, {
  valid: [
    "[123, 0.4, -42]",
    // not target
    {
      filename: "test.json6",
      code: "undefined",
      ignoreMomoa: true,
    },
    { code: "[undefined]", ignoreMomoa: true },
    { code: "{a: undefined}", ignoreMomoa: true },
  ],
  invalid: [
    {
      code: "[.4, +42]",
      output: "[0.4, 42]",
      errors: [
        {
          message: "Leading decimal point is not allowed in JSON.",
          line: 1,
          column: 2,
          endLine: 1,
          endColumn: 4,
        },
        {
          message: "Plus signs are not allowed in JSON.",
          line: 1,
          column: 6,
          endLine: 1,
          endColumn: 7,
        },
      ],
    },
    {
      code: "123.",
      output: "123",
      errors: ["Trailing decimal point is not allowed in JSON."],
    },
    {
      filename: "test.json5",
      code: "Infinity",
      output: null,
      errors: ["`Infinity` are not allowed in JSON."],
    },
    {
      code: "[Infinity, +Infinity, -Infinity]",
      output: null,
      errors: [
        "`Infinity` are not allowed in JSON.",
        "`Infinity` are not allowed in JSON.",
        "`Infinity` are not allowed in JSON.",
      ],
    },
    {
      filename: "test.json5",
      code: "NaN",
      output: null,
      errors: ["`NaN` are not allowed in JSON."],
    },
    {
      code: "[NaN, +NaN, -NaN]",
      output: null,
      errors: [
        "`NaN` are not allowed in JSON.",
        "`NaN` are not allowed in JSON.",
        "`NaN` are not allowed in JSON.",
      ],
    },
    {
      code: `{
                NaN :
                  NaN,
                Infinity:
                  Infinity
            }`,
      output: null,
      errors: [
        {
          message: "`NaN` are not allowed in JSON.",
          line: 3,
        },
        {
          message: "`Infinity` are not allowed in JSON.",
          line: 5,
        },
      ],
    },
    {
      code: "[- 123, -   123]",
      output: "[-123, -123]",
      errors: [
        {
          message: "Spaces after minus sign are not allowed in JSON.",
          line: 1,
          column: 3,
          endColumn: 4,
        },
        {
          message: "Spaces after minus sign are not allowed in JSON.",
          line: 1,
          column: 10,
          endColumn: 13,
        },
      ],
      ignoreMomoa: true,
    },
    {
      code: "0x123",
      output: "291",
      errors: [
        {
          message: "Hexadecimal literals are not allowed in JSON.",
          line: 1,
          column: 1,
          endColumn: 6,
        },
      ],
    },
    {
      code: "[-0x123, +0x123]",
      output: "[-291, 0x123]",
      errors: [
        "Hexadecimal literals are not allowed in JSON.",
        "Plus signs are not allowed in JSON.",
        "Hexadecimal literals are not allowed in JSON.",
      ],
    },
    {
      code: "[0o123,-0o123,+0o123]",
      output: "[83,-83,0o123]",
      errors: [
        "Octal literals are not allowed in JSON.",
        "Octal literals are not allowed in JSON.",
        "Plus signs are not allowed in JSON.",
        "Octal literals are not allowed in JSON.",
      ],
      ignoreMomoa: true,
    },
    {
      code: "[0b1001,-0b1001,+0b1001]",
      output: "[9,-9,0b1001]",
      errors: [
        "Binary literals are not allowed in JSON.",
        "Binary literals are not allowed in JSON.",
        "Plus signs are not allowed in JSON.",
        "Binary literals are not allowed in JSON.",
      ],
      ignoreMomoa: true,
    },
    {
      filename: "test.vue",
      code: `<custom-block lang="json">0x123</custom-block>`,
      output: `<custom-block lang="json">291</custom-block>`,
      errors: ["Hexadecimal literals are not allowed in JSON."],
      ...({
        languageOptions: {
          parser: vueParser,
        },
      } as any),
    },
  ],
});
