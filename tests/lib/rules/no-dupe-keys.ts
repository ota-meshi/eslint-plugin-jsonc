import { RuleTester } from "../test-lib/tester";
import rule from "../../../lib/rules/no-dupe-keys";
import * as jsonParser from "jsonc-eslint-parser";
import * as vueParser from "vue-eslint-parser";

const tester = new RuleTester({
  languageOptions: {
    parser: jsonParser,
  },
});

tester.run("no-dupe-keys", rule as any, {
  valid: ['{"key": "value"}', '{"key": "value", "key2": "value"}'],
  invalid: [
    {
      code: '{"key": "value", "key": "value"}',
      errors: ["Duplicate key 'key'."],
    },
    {
      filename: "test.vue",
      code: `<custom-block lang="json">{"key": "value", "key": "value"}</custom-block>`,
      errors: ["Duplicate key 'key'."],
      ...({
        languageOptions: {
          parser: vueParser,
        },
      } as any),
    },
  ],
});
