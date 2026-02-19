import { RuleTester } from "../test-lib/tester";
import rule from "../../../src/rules/space-unary-ops";
import * as jsonParser from "jsonc-eslint-parser";
import * as vueParser from "vue-eslint-parser";

const tester = new RuleTester({
  languageOptions: {
    parser: jsonParser,
  },
});

tester.run("space-unary-ops", rule, {
  valid: ["-1", "+1", "-0", "+0"],
  invalid: [
    {
      code: "[- 1, +  1, -  0, +  0]",
      output: "[-1, +1, -0, +0]",
      errors: [
        {
          message: "Unexpected space after unary operator '-'.",
          line: 1,
          column: 2,
          endColumn: 5,
        },
        {
          message: "Unexpected space after unary operator '+'.",
          line: 1,
          column: 7,
          endColumn: 11,
        },
        {
          message: "Unexpected space after unary operator '-'.",
          line: 1,
          column: 13,
          endColumn: 17,
        },
        {
          message: "Unexpected space after unary operator '+'.",
          line: 1,
          column: 19,
          endColumn: 23,
        },
      ],
      ignoreMomoa: true,
    },
    {
      filename: "test.vue",
      code: `<custom-block lang="json">- 1</custom-block>`,
      output: `<custom-block lang="json">-1</custom-block>`,
      errors: ["Unexpected space after unary operator '-'."],
      ...({
        languageOptions: {
          parser: vueParser,
        },
      } as any),
    },
  ],
});
