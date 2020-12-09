import { RuleTester } from "eslint"
import rule from "../../../lib/rules/no-parsing-error-in-vue-custom-block"

const tester = new RuleTester({
    parser: require.resolve("jsonc-eslint-parser"),
    parserOptions: {
        ecmaVersion: 2020,
    },
})

tester.run("no-parsing-error-in-vue-custom-block", rule as any, {
    valid: [
        '{"key": "value"}',
        '"string"',
        '["element"]',
        {
            code: `<i18n>{"key": "value"}</i18n>`,
            parser: require.resolve("vue-eslint-parser"),
        },
        {
            code: `<i18n lang="json5">/**/123</i18n>`,
            parser: require.resolve("vue-eslint-parser"),
        },
    ],
    invalid: [
        {
            code: `<i18n>{"key" "value"}</i18n>`,
            parser: require.resolve("vue-eslint-parser"),
            errors: [
                {
                    message: 'Unexpected token "value"',
                    line: 1,
                    column: 14,
                },
            ],
        },
        {
            code: `<i18n></i18n>`,
            parser: require.resolve("vue-eslint-parser"),
            errors: [
                {
                    message: "Unexpected end of expression.",
                    line: 1,
                    column: 7,
                },
            ],
        },
        {
            code: `<i18n>/**/123</i18n>`,
            parser: require.resolve("vue-eslint-parser"),
            errors: [
                {
                    message: "Unexpected comment.",
                    line: 1,
                    column: 7,
                },
            ],
        },
        {
            code: `<i18n lang="json">/**/123</i18n>`,
            parser: require.resolve("vue-eslint-parser"),
            errors: [
                {
                    message: "Unexpected comment.",
                    line: 1,
                    column: 19,
                },
            ],
        },
    ],
})
