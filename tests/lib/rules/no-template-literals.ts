import { RuleTester } from "../test-lib/tester.ts";
import rule from "../../../lib/rules/no-template-literals.ts";
import * as jsonParser from "jsonc-eslint-parser";
import * as vueParser from "vue-eslint-parser";

const tester = new RuleTester({
  languageOptions: {
    parser: jsonParser,
    ecmaVersion: 2020,
  },
  ignoreMomoa: true,
});

tester.run("no-template-literals", rule, {
  valid: ['{"key": "value"}', '"string"', '["element"]'],
  invalid: [
    {
      code: "`template`",
      output: '"template"',
      errors: ["The template literals are not allowed."],
    },
    {
      code: "[`template`]",
      output: '["template"]',
      errors: ["The template literals are not allowed."],
    },
    {
      code: '{"foo":`template`}',
      output: '{"foo":"template"}',
      errors: ["The template literals are not allowed."],
    },
    {
      code: "`temp\n\nlate`",
      output: '"temp\\n\\nlate"',
      errors: ["The template literals are not allowed."],
    },
    {
      filename: "test.vue",
      code: `<custom-block lang="json">{"foo":\`template\`}</custom-block>`,
      output: `<custom-block lang="json">{"foo":"template"}</custom-block>`,
      errors: ["The template literals are not allowed."],
      ...({
        languageOptions: {
          parser: vueParser,
        },
      } as any),
    },
  ],
});
