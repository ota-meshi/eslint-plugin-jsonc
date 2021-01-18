import { RuleTester } from "eslint"
import rule from "../../../lib/rules/comma-style"

const tester = new RuleTester({
    parser: require.resolve("jsonc-eslint-parser"),
})

tester.run("comma-style", rule as any, {
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
            errors: [
                "',' should be placed last.",
                "',' should be placed last.",
            ],
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
            parser: require.resolve("vue-eslint-parser"),
            errors: [
                "',' should be placed last.",
                "',' should be placed last.",
            ],
        },
    ],
})
