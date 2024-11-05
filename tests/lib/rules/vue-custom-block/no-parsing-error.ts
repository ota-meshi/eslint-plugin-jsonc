import rule from "../../../../lib/rules/vue-custom-block/no-parsing-error";
import { RuleTester } from "../../test-lib/tester";
import * as jsonParser from "jsonc-eslint-parser";
import * as vueParser from "vue-eslint-parser";

const tester = new RuleTester({
  languageOptions: {
    parser: jsonParser,
    ecmaVersion: 2020,
  },
});

tester.run("vue-custom-block/no-parsing-error", rule as any, {
  valid: [
    '{"key": "value"}',
    '"string"',
    '["element"]',
    {
      filename: "test.vue",
      code: `<i18n>{"key": "value"}</i18n>`,
      ...({
        languageOptions: {
          parser: vueParser,
        },
      } as any),
    },
    {
      filename: "test.vue",
      code: `<i18n lang="json5">/**/123</i18n>`,
      ...({
        languageOptions: {
          parser: vueParser,
        },
      } as any),
    },
  ],
  invalid: [
    {
      filename: "test.vue",
      code: `<i18n>{"key" "value"}</i18n>`,
      errors: [
        {
          message: `Unexpected token '"value"'.`,
          line: 1,
          column: 14,
        },
      ],
      ...({
        languageOptions: {
          parser: vueParser,
        },
      } as any),
    },
    {
      filename: "test.vue",
      code: `<i18n></i18n>`,
      errors: [
        {
          message: "Expected to be an expression, but got empty.",
          line: 1,
          column: 7,
        },
      ],
      ...({
        languageOptions: {
          parser: vueParser,
        },
      } as any),
    },
    {
      filename: "test.vue",
      code: `<i18n>/**/123</i18n>`,
      errors: [
        {
          message: "Unexpected comment.",
          line: 1,
          column: 7,
        },
      ],
      ...({
        languageOptions: {
          parser: vueParser,
        },
      } as any),
    },
    {
      filename: "test.vue",
      code: `<i18n lang="json">/**/123</i18n>`,
      errors: [
        {
          message: "Unexpected comment.",
          line: 1,
          column: 19,
        },
      ],
      ...({
        languageOptions: {
          parser: vueParser,
        },
      } as any),
    },
  ],
});
