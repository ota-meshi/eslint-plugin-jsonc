import { RuleTester } from "../test-lib/eslint-compat";
import rule from "../../../lib/rules/no-useless-escape";
import * as jsonParser from "jsonc-eslint-parser";
import * as vueParser from "vue-eslint-parser";

const tester = new RuleTester({
  languageOptions: {
    parser: jsonParser,
  },
});

tester.run("no-useless-escape", rule as any, {
  valid: ['"\\""'],
  invalid: [
    {
      filename: "test.json",
      code: '"hol\\a"',
      errors: ["Unnecessary escape character: \\a."],
    },
    {
      filename: "test.vue",
      code: `<custom-block lang="json">"hol\\a"</custom-block>`,
      errors: ["Unnecessary escape character: \\a."],
      ...({
        languageOptions: {
          parser: vueParser,
        },
      } as any),
    },
  ],
});
