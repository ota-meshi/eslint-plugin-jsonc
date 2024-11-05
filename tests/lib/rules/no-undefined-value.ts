import { RuleTester } from "../test-lib/tester";
import rule from "../../../lib/rules/no-undefined-value";
import * as jsonParser from "jsonc-eslint-parser";
import * as vueParser from "vue-eslint-parser";

const tester = new RuleTester({
  languageOptions: {
    parser: jsonParser,
  },
});

tester.run("no-undefined-value", rule as any, {
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
