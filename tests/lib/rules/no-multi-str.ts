import { RuleTester } from "../test-lib/tester";
import rule from "../../../lib/rules/no-multi-str";
import * as jsonParser from "jsonc-eslint-parser";
import * as vueParser from "vue-eslint-parser";

const tester = new RuleTester({
  languageOptions: {
    parser: jsonParser,
  },
});

tester.run("no-multi-str", rule, {
  valid: ['{"GOOD": "Line 1 \\nLine 2"}', '"Line 1 \\nLine 2"'],
  invalid: [
    {
      code: '{"GOOD": "Line 1 \\\nLine 2"}',
      errors: 1, // FIXME:  drop supports eslint6 ["Multiline support is limited to JSON5 only."],
    },
    {
      filename: "test.json",
      code: '"Line 1 \\\nLine 2"',
      errors: 1, // FIXME:  drop supports eslint6 ["Multiline support is limited to JSON5 only."],
    },
    {
      filename: "test.vue",
      code: `<custom-block lang="json">"Line 1 \\\nLine 2"</custom-block>`,
      errors: 1,
      languageOptions: {
        parser: vueParser,
      }, // FIXME:  drop supports eslint6 ["Multiline support is limited to JSON5 only."],
    },
  ],
});
