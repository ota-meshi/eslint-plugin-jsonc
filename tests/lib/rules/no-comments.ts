import { RuleTester } from "../test-lib/tester";
import rule from "../../../lib/rules/no-comments";
import * as jsonParser from "jsonc-eslint-parser";
import * as vueParser from "vue-eslint-parser";

const tester = new RuleTester({
  languageOptions: {
    parser: jsonParser,
  },
});

tester.run("no-comments", rule as any, {
  valid: ['{"key": "value"}', '"string"', '["element"]'],
  invalid: [
    {
      code: "{/* comment */}",
      errors: [
        {
          message: "Unexpected comment.",
          line: 1,
          column: 2,
          endLine: 1,
          endColumn: 15,
        },
      ],
    },
    {
      code: "{// comment\n}",
      errors: [
        {
          message: "Unexpected comment.",
          line: 1,
          column: 2,
          endLine: 1,
          endColumn: 12,
        },
      ],
    },
    {
      filename: "test.vue",
      code: `<custom-block lang="json">
            // comment
            "a"</custom-block>`,
      errors: ["Unexpected comment."],
      ...({
        languageOptions: {
          parser: vueParser,
        },
      } as any),
    },
  ],
});
