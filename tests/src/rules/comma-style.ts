import { RuleTester } from "../test-lib/tester";
import rule from "../../../src/rules/comma-style";
import * as jsonParser from "jsonc-eslint-parser";
import * as vueParser from "vue-eslint-parser";

const tester = new RuleTester({
  languageOptions: {
    parser: jsonParser,
  },
});

tester.run("comma-style", rule, {
  valid: [
    `{
            "GOOD": ["apples",
                "oranges"],
            "GOOD": {
                "a": 1,
                "b": 2
            }
        }`,
  ],
  invalid: [
    {
      code: `{
                "BAD": ["apples"
                    , "oranges"],
                "BAD": {
                    "a": 1
                    , "b": 2
                }
            }`,
      output: `{
                "BAD": ["apples",
                     "oranges"],
                "BAD": {
                    "a": 1,
                     "b": 2
                }
            }`,
      errors: ["',' should be placed last.", "',' should be placed last."],
    },
    {
      filename: "test.vue",
      code: `<i18n>{
                "BAD": ["apples"
                    , "oranges"],
                "BAD": {
                    "a": 1
                    , "b": 2
                }
            }</i18n>
            <custom-block lang="yml">{
                "BAD": ["apples"
                    , "oranges"],
                "BAD": {
                    "a": 1
                    , "b": 2
                }
            }</custom-block>`,
      output: `<i18n>{
                "BAD": ["apples",
                     "oranges"],
                "BAD": {
                    "a": 1,
                     "b": 2
                }
            }</i18n>
            <custom-block lang="yml">{
                "BAD": ["apples"
                    , "oranges"],
                "BAD": {
                    "a": 1
                    , "b": 2
                }
            }</custom-block>`,
      errors: ["',' should be placed last.", "',' should be placed last."],
      ...({
        languageOptions: {
          parser: vueParser,
        },
      } as any),
    },
  ],
});
