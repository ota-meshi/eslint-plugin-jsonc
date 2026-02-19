import { RuleTester } from "../test-lib/tester.ts";
import rule from "../../../lib/rules/no-sparse-arrays.ts";
import * as jsonParser from "jsonc-eslint-parser";
import * as vueParser from "vue-eslint-parser";
import semver from "semver";
import { ESLint } from "eslint";

const tester = new RuleTester({
  languageOptions: {
    parser: jsonParser,
  },
  ignoreMomoa: true,
});

tester.run("no-sparse-arrays", rule, {
  valid: ["[1,2,3,4]", "[1,2,3,4,]"],
  invalid: [
    {
      code: "[1,,,4]",
      errors: semver.gte(ESLint.version, "9.5.0")
        ? [
            "Unexpected comma in middle of array.",
            "Unexpected comma in middle of array.",
          ]
        : ["Unexpected comma in middle of array."],
    },
    {
      code: "[,2,3,4]",
      errors: ["Unexpected comma in middle of array."],
    },
    {
      filename: "test.vue",
      code: `<custom-block lang="json">[,,]</custom-block>`,
      errors: semver.gte(ESLint.version, "9.5.0")
        ? [
            "Unexpected comma in middle of array.",
            "Unexpected comma in middle of array.",
          ]
        : ["Unexpected comma in middle of array."],
      ...({
        languageOptions: {
          parser: vueParser,
        },
      } as any),
    },
  ],
});
