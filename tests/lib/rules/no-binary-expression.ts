import { RuleTester } from "eslint"
import rule from "../../../lib/rules/no-binary-expression"

const tester = new RuleTester({
    parser: require.resolve("jsonc-eslint-parser"),
    parserOptions: {
        ecmaVersion: 2020,
    },
})

tester.run("no-binary-expression", rule as any, {
    valid: ['{"42": 42}', "42", "[42]"],
    invalid: [
        {
            code: `[42-1, {"key": 42-1}]`,
            output: `[41, {"key": 41}]`,
            errors: [
                {
                    message: "The binary expressions are not allowed.",
                    line: 1,
                    column: 2,
                },
                {
                    message: "The binary expressions are not allowed.",
                    line: 1,
                    column: 16,
                },
            ],
        },
        {
            code: `42-1`,
            output: `41`,
            errors: ["The binary expressions are not allowed."],
        },
        {
            code: `[42 * (42 - 3)]`,
            output: `[1638]`,
            errors: [
                "The binary expressions are not allowed.",
                "The binary expressions are not allowed.",
            ],
        },
    ],
})
