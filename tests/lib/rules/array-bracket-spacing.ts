import { RuleTester } from "eslint";
import rule from "../../../lib/rules/array-bracket-spacing";

const tester = new RuleTester({
  parser: require.resolve("jsonc-eslint-parser"),
});

tester.run("array-bracket-spacing", rule as any, {
  valid: ['["element"]'],
  invalid: [
    {
      code: '[ "element" ]',
      output: '["element"]',
      errors: [
        "There should be no space after '['.",
        "There should be no space before ']'.",
      ],
    },
    {
      filename: "test.vue",
      code: `<i18n>[ 1, 2 ]</i18n><custom-block lang="jsonc">[ 1 ]</custom-block>`,
      output: `<i18n>[1, 2]</i18n><custom-block lang="jsonc">[1]</custom-block>`,
      parser: require.resolve("vue-eslint-parser"),
      errors: [
        "There should be no space after '['.",
        "There should be no space before ']'.",
        "There should be no space after '['.",
        "There should be no space before ']'.",
      ],
    },
  ],
});
