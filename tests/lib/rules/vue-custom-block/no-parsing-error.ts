import { RuleTester } from "eslint"
import rule from "../../../../lib/rules/vue-custom-block/no-parsing-error"

const tester = new RuleTester({
    parser: require.resolve("jsonc-eslint-parser"),
    parserOptions: {
        ecmaVersion: 2020,
    },
})

tester.run("vue-custom-block/no-parsing-error", rule as any, {
    valid: [
        '{"key": "value"}',
        '"string"',
        '["element"]',
        {
            filename: "test.vue",
            code: `<i18n>{"key": "value"}</i18n>`,
            parser: require.resolve("vue-eslint-parser"),
        },
        {
            filename: "test.vue",
            code: `<i18n lang="json5">/**/123</i18n>`,
            parser: require.resolve("vue-eslint-parser"),
        },
    ],
    invalid: [
        {
            filename: "test.vue",
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
            filename: "test.vue",
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
            filename: "test.vue",
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
            filename: "test.vue",
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
