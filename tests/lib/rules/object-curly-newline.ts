import { RuleTester } from "../test-lib/tester";
import rule from "../../../lib/rules/object-curly-newline";
import * as jsonParser from "jsonc-eslint-parser";
import * as vueParser from "vue-eslint-parser";

const tester = new RuleTester({
  languageOptions: {
    parser: jsonParser,
  },
});

tester.run("object-curly-newline", rule, {
  valid: ['{"key": "value"}', '{\n"key": "value"\n}'],
  invalid: [
    {
      code: '{\n"key": "value"}',
      output: '{"key": "value"}',
      errors: ["Unexpected line break after this opening brace."],
    },
    {
      filename: "test.vue",
      code: `<custom-block lang="json">{\n"key": "value"}</custom-block>`,
      output: `<custom-block lang="json">{"key": "value"}</custom-block>`,
      errors: ["Unexpected line break after this opening brace."],
      ...({
        languageOptions: {
          parser: vueParser,
        },
      } as any),
    },
  ],
});
