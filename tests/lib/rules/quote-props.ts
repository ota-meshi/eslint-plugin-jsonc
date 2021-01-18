import { RuleTester } from "eslint"
import rule from "../../../lib/rules/quote-props"

const tester = new RuleTester({
    parser: require.resolve("jsonc-eslint-parser"),
})

tester.run("quote-props", rule as any, {
    valid: ['{"key": "value"}', '"string"', '["element"]'],
    invalid: [
        {
            code: '{key: "value"}',
            output: '{"key": "value"}',
            errors: ["Unquoted property 'key' found."],
        },
        {
            filename: "test.vue",
            code: `<custom-block lang="json">{key: "value"}</custom-block>`,
            output: `<custom-block lang="json">{"key": "value"}</custom-block>`,
            parser: require.resolve("vue-eslint-parser"),
            errors: ["Unquoted property 'key' found."],
        },
    ],
})
