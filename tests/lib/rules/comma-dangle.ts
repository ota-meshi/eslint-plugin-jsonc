import { RuleTester } from "../test-lib/tester.ts";
import rule from "../../../lib/rules/comma-dangle.ts";
import * as jsonParser from "jsonc-eslint-parser";
import * as vueParser from "vue-eslint-parser";

const tester = new RuleTester({
  languageOptions: {
    parser: jsonParser,
  },
});

tester.run("comma-dangle", rule, {
  valid: ['{"key": "value"}'],
  invalid: [
    {
      code: '{"key": "value",}',
      output: '{"key": "value"}',
      errors: ["Unexpected trailing comma."],
    },
    {
      code: '{"key": [1,2],}',
      output: '{"key": [1,2,],}',
      options: [{ arrays: "always", objects: "never" }],
      errors: ["Missing trailing comma.", "Unexpected trailing comma."],
    },
    {
      filename: "test.vue",
      code: `<i18n>{"key": "value",}</i18n><custom-block>{"key": "value",}</custom-block>`,
      output: `<i18n>{"key": "value"}</i18n><custom-block>{"key": "value",}</custom-block>`,
      errors: ["Unexpected trailing comma."],
      ...({
        languageOptions: {
          parser: vueParser,
        },
      } as any),
    },
  ],
});
