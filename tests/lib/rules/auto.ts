import path from "path"
import { RuleTester, Linter } from "eslint"
import rule from "../../../lib/rules/auto"
import semver from "semver"

const tester = new RuleTester({
    parser: require.resolve("jsonc-eslint-parser"),
    parserOptions: {
        ecmaVersion: 2020,
    },
})

const ROOT_DIR = path.join(__dirname, "../../fixtures/auto")

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
            parser: require.resolve("vue-eslint-parser"),
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
    "b": 2${semver.gte(Linter.version, "8.11.0") ? "," : ""}}
</block>
<block lang="json">
{"foo": 1,
"bar": 2,
"foo": 3}
</block>`,
            parser: require.resolve("vue-eslint-parser"),
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
            parser: require.resolve("vue-eslint-parser"),
            errors: [
                "[jsonc/indent] Expected indentation of 4 spaces but found 0.",
                "[jsonc/indent] Expected indentation of 0 spaces but found 4.",
            ],
        },
    ],
})
