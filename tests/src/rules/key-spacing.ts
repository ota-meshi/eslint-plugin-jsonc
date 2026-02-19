import { RuleTester } from "../test-lib/tester";
import rule from "../../../src/rules/key-spacing";
import * as jsonParser from "jsonc-eslint-parser";
import * as vueParser from "vue-eslint-parser";

const tester = new RuleTester({
  languageOptions: {
    parser: jsonParser,
  },
});

tester.run("key-spacing", rule, {
  valid: ['{"key": "value"}'],
  invalid: [
    {
      code: '{"key" :"value"}',
      output: '{"key": "value"}',
      errors: [
        "Extra space after key 'key'.",
        "Missing space before value for key 'key'.",
      ],
    },
    {
      filename: "test.vue",
      code: `<custom-block lang="json">{"key" :"value"}</custom-block>`,
      output: `<custom-block lang="json">{"key": "value"}</custom-block>`,
      errors: [
        "Extra space after key 'key'.",
        "Missing space before value for key 'key'.",
      ],
      ...({
        languageOptions: {
          parser: vueParser,
        },
      } as any),
    },
  ],
});
