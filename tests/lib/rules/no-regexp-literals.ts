import { RuleTester } from "../test-lib/tester";
import rule from "../../../lib/rules/no-regexp-literals";
import * as jsonParser from "jsonc-eslint-parser";
import * as vueParser from "vue-eslint-parser";

const tester = new RuleTester({
  languageOptions: {
    parser: jsonParser,
  },
  ignoreMomoa: true,
});

tester.run("no-regexp-literals", rule, {
  valid: ['{"key": "value"}', '"string"', '["element"]'],
  invalid: [
    {
      code: "/reg/",
      errors: ["RegExp literals are not allowed."],
    },
    {
      code: "[/reg/, {'/val/': /reg/}]",
      errors: [
        "RegExp literals are not allowed.",
        "RegExp literals are not allowed.",
      ],
    },
    {
      filename: "test.vue",
      code: `<custom-block lang="json">/reg/</custom-block>`,
      errors: ["RegExp literals are not allowed."],
      ...({
        languageOptions: {
          parser: vueParser,
        },
      } as any),
    },
  ],
});
