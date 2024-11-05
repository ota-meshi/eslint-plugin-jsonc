import { RuleTester } from "../test-lib/tester";
import rule from "../../../lib/rules/no-octal-escape";
import * as jsonParser from "jsonc-eslint-parser";
import * as vueParser from "vue-eslint-parser";

const tester = new RuleTester({
  languageOptions: {
    parser: jsonParser,
  },
});

tester.run("no-octal-escape", rule as any, {
  valid: ['{"GOOD": "Copyright \\u00A9"}'],
  invalid: [
    {
      code: '{"BAD": "Copyright \\251"}',
      errors: ["Don't use octal: '\\251'. Use '\\u....' instead."],
      ...({
        languageOptions: {
          sourceType: "script",
        },
      } as any),
    },
    {
      filename: "test.vue",
      code: `<custom-block lang="json">{"BAD": "Copyright \\251"}</custom-block>`,
      errors: ["Don't use octal: '\\251'. Use '\\u....' instead."],
      ...({
        languageOptions: {
          sourceType: "script",
          parser: vueParser,
        },
      } as any),
    },
  ],
});
