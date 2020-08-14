import { RuleTester } from "eslint"
import rule from "../../../lib/rules/space-unary-ops"

const tester = new RuleTester({
    parser: require.resolve("jsonc-eslint-parser"),
})

tester.run("space-unary-ops", rule as any, {
    valid: ["-1", "+1", "-0", "+0"],
    invalid: [
        {
            code: "[- 1, +  1, -  0, +  0]",
            output: "[-1, +1, -0, +0]",
            errors: [
                {
                    message: "Unexpected space after unary operator '-'.",
                    line: 1,
                    column: 2,
                    endColumn: 5,
                },
                {
                    message: "Unexpected space after unary operator '+'.",
                    line: 1,
                    column: 7,
                    endColumn: 11,
                },
                {
                    message: "Unexpected space after unary operator '-'.",
                    line: 1,
                    column: 13,
                    endColumn: 17,
                },
                {
                    message: "Unexpected space after unary operator '+'.",
                    line: 1,
                    column: 19,
                    endColumn: 23,
                },
            ],
        },
    ],
})
