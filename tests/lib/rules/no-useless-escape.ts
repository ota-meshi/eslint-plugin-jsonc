import { RuleTester } from "../test-lib/tester";
import rule from "../../../lib/rules/no-useless-escape";
import * as jsonParser from "jsonc-eslint-parser";
import * as vueParser from "vue-eslint-parser";

const tester = new RuleTester({
  languageOptions: {
    parser: jsonParser,
  },
});

tester.run("no-useless-escape", rule, {
  valid: ['"\\""'],
  invalid: [
    {
      filename: "test.json",
      code: '"hol\\a"',
      errors: [
        {
          message: "Unnecessary escape character: \\a.",
          suggestions: [
            { messageId: "removeEscape", output: `"hola"` },
            { messageId: "escapeBackslash", output: String.raw`"hol\\a"` },
          ],
        },
      ],
    },
    {
      filename: "test.vue",
      code: `<custom-block lang="json">"hol\\a"</custom-block>`,
      errors: [
        {
          message: "Unnecessary escape character: \\a.",
          suggestions: [
            {
              messageId: "removeEscape",
              output: `<custom-block lang="json">"hola"</custom-block>`,
            },
            {
              messageId: "escapeBackslash",
              output: String.raw`<custom-block lang="json">"hol\\a"</custom-block>`,
            },
          ],
        },
      ],
      languageOptions: {
        parser: vueParser,
      },
    },
  ],
});
