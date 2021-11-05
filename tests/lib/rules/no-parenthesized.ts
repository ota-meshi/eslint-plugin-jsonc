import { RuleTester } from "eslint"
import rule from "../../../lib/rules/no-parenthesized"

const tester = new RuleTester({
    parser: require.resolve("jsonc-eslint-parser"),
    parserOptions: {
        ecmaVersion: 2020,
    },
})

tester.run("no-parenthesized", rule as any, {
    valid: ["{42: 42}", "42", "[42]"],
    invalid: [
        {
            code: `[(42), {key: (42)}]`,
            output: `[42, {key: 42}]`,
            errors: [
                {
                    message:
                        "Parentheses around expression should not be used.",
                    line: 1,
                    column: 2,
                },
                {
                    message:
                        "Parentheses around expression should not be used.",
                    line: 1,
                    column: 5,
                },
                {
                    message:
                        "Parentheses around expression should not be used.",
                    line: 1,
                    column: 14,
                },
                {
                    message:
                        "Parentheses around expression should not be used.",
                    line: 1,
                    column: 17,
                },
            ],
        },
        {
            code: `(42)`,
            output: `42`,
            errors: [
                {
                    message:
                        "Parentheses around expression should not be used.",
                    line: 1,
                    column: 1,
                },
                {
                    message:
                        "Parentheses around expression should not be used.",
                    line: 1,
                    column: 4,
                },
            ],
        },
        {
            code: `[-(42), 42 + (42 - 3)]`,
            output: null,
            errors: [
                {
                    message:
                        "Parentheses around expression should not be used.",
                    line: 1,
                    column: 3,
                },
                {
                    message:
                        "Parentheses around expression should not be used.",
                    line: 1,
                    column: 6,
                },
                {
                    message:
                        "Parentheses around expression should not be used.",
                    line: 1,
                    column: 14,
                },
                {
                    message:
                        "Parentheses around expression should not be used.",
                    line: 1,
                    column: 21,
                },
            ],
        },
    ],
})
