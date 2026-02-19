import { RuleTester } from "../test-lib/tester.ts";
import rule from "../../../lib/rules/array-element-newline.ts";
import * as jsonParser from "jsonc-eslint-parser";
import * as vueParser from "vue-eslint-parser";

const tester = new RuleTester({
  languageOptions: {
    parser: jsonParser,
  },
});

tester.run("array-element-newline", rule, {
  valid: [
    `[1,
            2,
            3]`,
  ],
  invalid: [
    {
      code: "[1, 2, 3]",
      output: `[1,
2,
3]`,
      errors: [
        "There should be a linebreak after this element.",
        "There should be a linebreak after this element.",
      ],
    },
    {
      filename: "test.vue",
      code: `<i18n>[1, 2, 3]</i18n><custom-block lang="json5">[1, 2, 3]</custom-block>`,
      output: `<i18n>[1,
2,
3]</i18n><custom-block lang="json5">[1,
2,
3]</custom-block>`,
      errors: [
        "There should be a linebreak after this element.",
        "There should be a linebreak after this element.",
        "There should be a linebreak after this element.",
        "There should be a linebreak after this element.",
      ],
      ...({
        languageOptions: {
          parser: vueParser,
        },
      } as any),
    },
  ],
});
