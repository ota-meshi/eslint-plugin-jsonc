import { RuleTester } from "eslint"
import rule from "../../../lib/rules/sort-array-values"

const tester = new RuleTester({
    parser: require.resolve("jsonc-eslint-parser"),
    parserOptions: {
        ecmaVersion: 2020,
    },
})

tester.run("sort-array-values", rule as any, {
    valid: [
        '{"key": "value"}', '"string"', '["element"]'
    ],
    invalid: [
        {
            code: `{}`,
            errors: [
                ""
            ],
        },
    ],
})
