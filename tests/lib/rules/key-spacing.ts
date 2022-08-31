import { RuleTester } from "eslint";
import rule from "../../../lib/rules/key-spacing";

const tester = new RuleTester({
  parser: require.resolve("jsonc-eslint-parser"),
});

tester.run("key-spacing", rule as any, {
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
      parser: require.resolve("vue-eslint-parser"),
      errors: [
        "Extra space after key 'key'.",
        "Missing space before value for key 'key'.",
      ],
    },
  ],
});
