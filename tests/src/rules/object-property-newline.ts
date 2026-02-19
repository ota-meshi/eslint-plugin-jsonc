import { RuleTester } from "../test-lib/tester";
import rule from "../../../src/rules/object-property-newline";
import * as jsonParser from "jsonc-eslint-parser";
import * as vueParser from "vue-eslint-parser";

const tester = new RuleTester({
  languageOptions: {
    parser: jsonParser,
  },
});

tester.run("object-property-newline", rule, {
  valid: [
    `
        {
            "foo": "foo",
            "bar": "bar",
            "baz": "baz"
        }
        `,
  ],
  invalid: [
    {
      code: `
            {
                "foo": "foo", "bar": "bar", "baz": "baz"
            }`,
      output: `
            {
                "foo": "foo",
"bar": "bar",
"baz": "baz"
            }`,
      errors: [
        "Object properties must go on a new line.",
        "Object properties must go on a new line.",
      ],
    },
    {
      filename: "test.vue",
      code: `<custom-block lang="json">{ "foo": "foo", "bar": "bar" }</custom-block>`,
      output: `<custom-block lang="json">{ "foo": "foo",\n"bar": "bar" }</custom-block>`,
      errors: ["Object properties must go on a new line."],
      ...({
        languageOptions: {
          parser: vueParser,
        },
      } as any),
    },
  ],
});
