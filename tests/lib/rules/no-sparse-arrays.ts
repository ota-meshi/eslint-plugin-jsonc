import { RuleTester } from "../test-lib/eslint-compat";
import rule from "../../../lib/rules/no-sparse-arrays";
import * as jsonParser from "jsonc-eslint-parser";
import * as vueParser from "vue-eslint-parser";

const tester = new RuleTester({
  languageOptions: {
    parser: jsonParser,
  },
});

tester.run("no-sparse-arrays", rule as any, {
  valid: ["[1,2,3,4]", "[1,2,3,4,]"],
  invalid: [
    {
      code: "[1,,,4]",
      errors: ["Unexpected comma in middle of array."],
    },
    {
      code: "[,2,3,4]",
      errors: ["Unexpected comma in middle of array."],
    },
    {
      filename: "test.vue",
      code: `<custom-block lang="json">[,,]</custom-block>`,
      errors: ["Unexpected comma in middle of array."],
      ...({
        languageOptions: {
          parser: vueParser,
        },
      } as any),
    },
  ],
});
