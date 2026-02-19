import { RuleTester } from "../test-lib/tester.ts";
import rule from "../../../lib/rules/quotes.ts";
import * as jsonParser from "jsonc-eslint-parser";
import * as vueParser from "vue-eslint-parser";

const tester = new RuleTester({
  languageOptions: {
    parser: jsonParser,
  },
});

tester.run("quotes", rule, {
  valid: ['{"key": "value"}', '"string"', '["element"]'],
  invalid: [
    {
      code: "{'key': 'value'}",
      output: '{"key": "value"}',
      errors: [
        "Strings must use doublequote.",
        "Strings must use doublequote.",
      ],
    },
    {
      filename: "test.json",
      code: "'string'",
      output: '"string"',
      errors: ["Strings must use doublequote."],
    },
    {
      code: "['element']",
      output: '["element"]',
      errors: ["Strings must use doublequote."],
    },
    {
      filename: "test.vue",
      code: `<custom-block lang="json">['element']</custom-block>`,
      output: `<custom-block lang="json">["element"]</custom-block>`,
      errors: ["Strings must use doublequote."],
      ...({
        languageOptions: {
          parser: vueParser,
        },
      } as any),
    },
  ],
});
