import { RuleTester } from "../test-lib/tester";
import rule from "../../../lib/rules/no-numeric-separators";
import { Linter } from "eslint";
import semver from "semver";
import * as jsonParser from "jsonc-eslint-parser";
import * as vueParser from "vue-eslint-parser";
if (!semver.gte(Linter.version, "7.3.0")) {
  // @ts-expect-error
  return;
}
const tester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2021,
    parser: jsonParser,
  },
  ignoreMomoa: true,
});

tester.run("no-numeric-separators", rule as any, {
  valid: ['{"key": 1234}', "1234", "[1234]"],
  invalid: [
    {
      code: `{"key": 1_234}`,
      output: `{"key": 1234}`,
      errors: ["Numeric separators are not allowed."],
    },
    {
      code: `1_234`,
      output: `1234`,
      errors: ["Numeric separators are not allowed."],
    },
    {
      code: `[1_234]`,
      output: `[1234]`,
      errors: ["Numeric separators are not allowed."],
    },
    {
      filename: "test.vue",
      code: `<custom-block lang="json">{"a": 1_23}</custom-block>`,
      output: `<custom-block lang="json">{"a": 123}</custom-block>`,
      errors: ["Numeric separators are not allowed."],
      ...({
        languageOptions: {
          parser: vueParser,
        },
      } as any),
    },
  ],
});
