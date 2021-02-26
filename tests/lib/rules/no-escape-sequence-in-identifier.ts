import { RuleTester } from "eslint"
import rule from "../../../lib/rules/no-escape-sequence-in-identifier"

const tester = new RuleTester({
    parser: require.resolve("jsonc-eslint-parser"),
    parserOptions: {
        ecmaVersion: 2020,
    },
})

tester.run("no-escape-sequence-in-identifier", rule as any, {
    valid: ["{key: 42}"],
    invalid: [
        {
            code: `{\\u0041_\\u{42}: "\\u0043\\u{44}"}`,
            output: `{A_B: "\\u0043\\u{44}"}`,
            errors: [
                {
                    message:
                        "Escape sequence in identifiers should not be used.",
                    line: 1,
                    column: 2,
                },
                {
                    message:
                        "Escape sequence in identifiers should not be used.",
                    line: 1,
                    column: 9,
                },
            ],
        },
    ],
})
