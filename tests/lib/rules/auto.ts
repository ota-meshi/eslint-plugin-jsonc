import path from "path";
import { RuleTester } from "../test-lib/eslint-compat";
import rule from "../../../lib/rules/auto";
import * as jsonParser from "jsonc-eslint-parser";
import * as vueParser from "vue-eslint-parser";

const tester = new RuleTester({
  languageOptions: {
    parser: jsonParser,
    ecmaVersion: 2020,
  },
});

const ROOT_DIR = path.join(__dirname, "../../fixtures/auto");

tester.run("auto", rule as any, {
  valid: [
    {
      filename: path.join(ROOT_DIR, "test01", "sfc.vue"),
      code: `
<i18n>
{
    "foo": "bar"
}
</i18n>`,
      ...({
        languageOptions: {
          parser: vueParser,
        },
      } as any),
    },
    {
      filename: path.join(ROOT_DIR, "test03", "test.json"),
      code: `{
                "foo": "bar"
            }`,
    },
  ],
  invalid: [
    {
      filename: path.join(ROOT_DIR, "test01", "sfc.vue"),
      code: `
<i18n>
{
"foo": "bar"
    }
</i18n>
<block lang="json">
[1,[
    1,
    2 ],2]
</block>
<block lang="json">
{"a":1
    ,"b":2,}
</block>
<block lang="json">
{ "foo": 1,"bar": 2,"foo": 3 }
</block>`,
      output: `
<i18n>
{
    "foo": "bar"
}
</i18n>
<block lang="json">
[
1,
[
    1,
    2],
2
]
</block>
<block lang="json">
{"a": 1,
    "b": 2,}
</block>
<block lang="json">
{"foo": 1,
"bar": 2,
"foo": 3}
</block>`,
      errors: [
        "[jsonc/indent] Expected indentation of 4 spaces but found 0.",
        "[jsonc/indent] Expected indentation of 0 spaces but found 4.",

        "[jsonc/array-bracket-newline] A linebreak is required after '['.",
        "[jsonc/array-element-newline] There should be a linebreak after this element.",
        "[jsonc/array-bracket-spacing] There should be no space before ']'.",
        "[jsonc/array-bracket-newline] A linebreak is required before ']'.",
        "[jsonc/array-element-newline] There should be a linebreak after this element.",
        "[jsonc/array-bracket-newline] A linebreak is required before ']'.",

        "[jsonc/key-spacing] Missing space before value for key 'a'.",
        "[jsonc/comma-style] ',' should be placed last.",
        "[jsonc/key-spacing] Missing space before value for key 'b'.",
        "[jsonc/comma-dangle] Unexpected trailing comma.",

        "[jsonc/object-curly-spacing] There should be no space after '{'.",
        "[jsonc/object-property-newline] Object properties must go on a new line.",
        "[jsonc/sort-keys] Expected object keys to be in ascending order. 'bar' should be before 'foo'.",
        "[jsonc/object-property-newline] Object properties must go on a new line.",
        "[jsonc/no-dupe-keys] Duplicate key 'foo'.",
        "[jsonc/object-curly-spacing] There should be no space before '}'.",
      ],
      ...({
        languageOptions: {
          parser: vueParser,
        },
      } as any),
    },
    {
      filename: path.join(ROOT_DIR, "test02", "sfc.vue"),
      code: `
<i18n>
{
"foo": "bar"
    }
</i18n>`,
      output: `
<i18n>
{
    "foo": "bar"
}
</i18n>`,
      errors: [
        "[jsonc/indent] Expected indentation of 4 spaces but found 0.",
        "[jsonc/indent] Expected indentation of 0 spaces but found 4.",
      ],
      ...({
        languageOptions: {
          parser: vueParser,
        },
      } as any),
    },
  ],
});
