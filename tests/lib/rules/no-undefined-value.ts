import { RuleTester } from "../test-lib/tester.ts";
import rule from "../../../lib/rules/no-undefined-value.ts";
import * as jsonParser from "jsonc-eslint-parser";
import * as vueParser from "vue-eslint-parser";

const tester = new RuleTester({
  languageOptions: {
    parser: jsonParser,
  },
  ignoreMomoa: true,
});

tester.run("no-undefined-value", rule, {
  valid: ["null", "[1,,2]", "{undefined:1}"],
  invalid: [
    {
      code: "undefined",
      errors: ["`undefined` is not allowed."],
    },
    {
      code: `[
                undefined,
                {
                    undefined: undefined
                }
            ]`,
      errors: [
        {
          message: "`undefined` is not allowed.",
          line: 2,
          column: 17,
          endColumn: 26,
        },
        {
          message: "`undefined` is not allowed.",
          line: 4,
          column: 32,
          endColumn: 41,
        },
      ],
    },
    {
      filename: "test.vue",
      code: `<custom-block lang="json">undefined</custom-block>`,
      errors: ["`undefined` is not allowed."],
      ...({
        languageOptions: {
          parser: vueParser,
        },
      } as any),
    },
  ],
});
