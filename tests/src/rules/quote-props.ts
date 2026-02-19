import { RuleTester } from "../test-lib/tester";
import rule from "../../../src/rules/quote-props";
import * as jsonParser from "jsonc-eslint-parser";
import * as vueParser from "vue-eslint-parser";

const tester = new RuleTester({
  languageOptions: {
    parser: jsonParser,
  },
});

tester.run("quote-props", rule, {
  valid: ['{"key": "value"}', '"string"', '["element"]'],
  invalid: [
    {
      code: '{key: "value"}',
      output: '{"key": "value"}',
      errors: ["Unquoted property 'key' found."],
    },
    {
      filename: "test.vue",
      code: `<custom-block lang="json">{key: "value"}</custom-block>`,
      output: `<custom-block lang="json">{"key": "value"}</custom-block>`,
      errors: ["Unquoted property 'key' found."],
      ...({
        languageOptions: {
          parser: vueParser,
        },
      } as any),
    },
  ],
});
