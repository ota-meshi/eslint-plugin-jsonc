import { RuleTester } from "eslint";
import rule from "../../../lib/rules/no-comments";

const tester = new RuleTester({
  parser: require.resolve("jsonc-eslint-parser"),
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
      parser: require.resolve("vue-eslint-parser"),
      errors: ["Unexpected comment."],
    },
  ],
});
