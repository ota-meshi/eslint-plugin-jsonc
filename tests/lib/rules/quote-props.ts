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
    ],
})
