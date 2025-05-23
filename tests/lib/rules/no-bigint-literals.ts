import { RuleTester } from "../test-lib/tester";
import rule from "../../../lib/rules/no-bigint-literals";
import * as jsonParser from "jsonc-eslint-parser";
import * as vueParser from "vue-eslint-parser";

const tester = new RuleTester({
  languageOptions: {
    parser: jsonParser,
    ecmaVersion: 2020,
  },
  ignoreMomoa: true,
});

tester.run("no-bigint-literals", rule, {
  valid: ['{"key": "value"}', '"string"', '["element"]'],
  invalid: [
    {
      code: "42n",
      errors: ["BigInt literals are not allowed."],
    },
    {
      code: "[1n, {'2n': 3n}]",
      errors: [
        "BigInt literals are not allowed.",
        "BigInt literals are not allowed.",
      ],
    },
    {
      filename: "test.vue",
      code: `<custom-block lang="json">42n</custom-block>`,
      errors: ["BigInt literals are not allowed."],
      ...({
        languageOptions: {
          parser: vueParser,
        },
      } as any),
    },
  ],
});
