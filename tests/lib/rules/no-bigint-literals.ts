import { RuleTester } from "eslint"
import rule from "../../../lib/rules/no-bigint-literals"

const tester = new RuleTester({
    parser: require.resolve("jsonc-eslint-parser"),
    parserOptions: {
        ecmaVersion: 2020,
    },
})

tester.run("no-bigint-literals", rule as any, {
    valid: ['{"key": "value"}', '"string"', '["element"]'],
    invalid: [
        {
            code: "42n",
            errors: ["BigInt literals are not allowed."],
        },
        {
            code: "[1n, {'2n': 3n}]",
            errors: [
                "BigInt literals are not allowed.",
                "BigInt literals are not allowed.",
            ],
        },
    ],
})
