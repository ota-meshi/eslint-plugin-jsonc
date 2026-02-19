import { RuleTester } from "../test-lib/tester";
import rule from "../../../src/rules/array-bracket-newline";
import * as jsonParser from "jsonc-eslint-parser";
import * as vueParser from "vue-eslint-parser";

const tester = new RuleTester({
  languageOptions: {
    parser: jsonParser,
  },
});

tester.run("array-bracket-newline", rule, {
  valid: ["[]", "[\n1,\n2\n]"],
  invalid: [
    {
      code: "[\n1\n]",
      output: "[1]",
      errors: [
        "There should be no linebreak after '['.",
        "There should be no linebreak before ']'.",
      ],
    },
    {
      code: "[1,\n2]",
      output: "[\n1,\n2\n]",
      errors: [
        "A linebreak is required after '['.",
        "A linebreak is required before ']'.",
      ],
    },
    {
      filename: "test.vue",
      code: `<i18n>[1,\n2]</i18n><custom-block lang="json">[\n1\n]</custom-block>`,
      output: `<i18n>[\n1,\n2\n]</i18n><custom-block lang="json">[1]</custom-block>`,
      errors: [
        "A linebreak is required after '['.",
        "A linebreak is required before ']'.",
        "There should be no linebreak after '['.",
        "There should be no linebreak before ']'.",
      ],
      ...({
        languageOptions: {
          parser: vueParser,
        },
      } as any),
    },
  ],
});
