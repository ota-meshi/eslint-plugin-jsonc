import { RuleTester } from "eslint"
import rule from "../../../lib/rules/valid-json-number"

const tester = new RuleTester({
    parser: require.resolve("../../../lib/parser/json-eslint-parser"),
})

tester.run("valid-json-number", rule as any, {
    valid: ["[123, 0.4, -42]"],
    invalid: [
        {
            code: "[.4, +42]",
            output: "[0.4, 42]",
            errors: [
                {
                    message: "Invalid number for JSON.",
                    line: 1,
                    column: 2,
                    endLine: 1,
                    endColumn: 4,
                },
                {
                    message: "Invalid number for JSON.",
                    line: 1,
                    column: 6,
                    endLine: 1,
                    endColumn: 9,
                },
            ],
        },
        {
            code: "123.",
            output: "123",
            errors: ["Invalid number for JSON."],
        },
        {
            code: "[Infinity, +Infinity, -Infinity]",
            output: null,
            errors: [
                "Invalid number for JSON.",
                "Invalid number for JSON.",
                "Invalid number for JSON.",
            ],
        },
        {
            code: "[NaN, +NaN, -NaN]",
            output: null,
            errors: [
                "Invalid number for JSON.",
                "Invalid number for JSON.",
                "Invalid number for JSON.",
            ],
        },
        {
            code: `{
                NaN :
                  NaN,
                Infinity:
                  Infinity
            }`,
            output: null,
            errors: [
                {
                    message: "Invalid number for JSON.",
                    line: 3,
                },
                {
                    message: "Invalid number for JSON.",
                    line: 5,
                },
            ],
        },
    ],
})
