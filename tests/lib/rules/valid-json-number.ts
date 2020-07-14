import { RuleTester } from "eslint"
import rule from "../../../lib/rules/valid-json-number"

const tester = new RuleTester({
    parser: require.resolve("../../../lib/parser/json-eslint-parser"),
})

tester.run("valid-json-number", rule as any, {
    valid: [
        "[123, 0.4, -42]",
        // not target
        {
            filename: "test.json6",
            code: "undefined",
        },
        "[undefined]",
        "{a: undefined}",
    ],
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
                    message: "Plus signs are not allowed in JSON.",
                    line: 1,
                    column: 6,
                    endLine: 1,
                    endColumn: 7,
                },
            ],
        },
        {
            code: "123.",
            output: "123",
            errors: ["Invalid number for JSON."],
        },
        {
            filename: "test.json5",
            code: "Infinity",
            output: null,
            errors: ["`Infinity` are not allowed in JSON."],
        },
        {
            code: "[Infinity, +Infinity, -Infinity]",
            output: null,
            errors: [
                "`Infinity` are not allowed in JSON.",
                "`Infinity` are not allowed in JSON.",
                "`Infinity` are not allowed in JSON.",
            ],
        },
        {
            filename: "test.json5",
            code: "NaN",
            output: null,
            errors: ["`NaN` are not allowed in JSON."],
        },
        {
            code: "[NaN, +NaN, -NaN]",
            output: null,
            errors: [
                "`NaN` are not allowed in JSON.",
                "`NaN` are not allowed in JSON.",
                "`NaN` are not allowed in JSON.",
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
                    message: "`NaN` are not allowed in JSON.",
                    line: 3,
                },
                {
                    message: "`Infinity` are not allowed in JSON.",
                    line: 5,
                },
            ],
        },
        {
            code: "[- 123, -   123]",
            output: "[-123, -123]",
            errors: [
                {
                    message: "Spaces after minus sign are not allowed in JSON.",
                    line: 1,
                    column: 3,
                    endColumn: 4,
                },
                {
                    message: "Spaces after minus sign are not allowed in JSON.",
                    line: 1,
                    column: 10,
                    endColumn: 13,
                },
            ],
        },
        {
            code: "0x123",
            output: "291",
            errors: [
                {
                    message: "Invalid number for JSON.",
                    line: 1,
                    column: 1,
                    endColumn: 6,
                },
            ],
        },
    ],
})
