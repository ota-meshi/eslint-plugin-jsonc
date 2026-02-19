import { RuleTester } from "../test-lib/tester.ts";
import rule from "../../../lib/rules/no-number-props.ts";
import * as jsonParser from "jsonc-eslint-parser";
import * as vueParser from "vue-eslint-parser";

const tester = new RuleTester({
  languageOptions: {
    parser: jsonParser,
  },
  ignoreMomoa: true,
});

tester.run("no-number-props", rule, {
  valid: ['{"key": 123}', "{key: 123}", "123", "[123]"],
  invalid: [
    {
      code: "{123: 123}",
      output: '{"123": 123}',
      errors: ["The number property keys are not allowed."],
    },
    {
      filename: "test.vue",
      code: `<custom-block lang="json">{123: 123}</custom-block>`,
      output: `<custom-block lang="json">{"123": 123}</custom-block>`,
      errors: ["The number property keys are not allowed."],
      ...({
        languageOptions: {
          parser: vueParser,
        },
      } as any),
    },
  ],
});
