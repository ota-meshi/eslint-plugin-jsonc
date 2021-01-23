import { RuleTester } from "eslint"
import rule from "../../../lib/rules/valid-json-number"

const tester = new RuleTester({
    parser: require.resolve("jsonc-eslint-parser"),
    parserOptions: {
        ecmaVersion: 2020,
    },
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
                    message: "Leading decimal point is not allowed in JSON.",
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
            errors: ["Trailing decimal point is not allowed in JSON."],
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
                    message: "Hexadecimal literals are not allowed in JSON.",
                    line: 1,
                    column: 1,
                    endColumn: 6,
                },
            ],
        },
        {
            code: "[-0x123, +0x123]",
            output: "[-291, 0x123]",
            errors: [
                "Hexadecimal literals are not allowed in JSON.",
                "Plus signs are not allowed in JSON.",
                "Hexadecimal literals are not allowed in JSON.",
            ],
        },
        {
            code: "[0o123,-0o123,+0o123]",
            output: "[83,-83,0o123]",
            errors: [
                "Octal literals are not allowed in JSON.",
                "Octal literals are not allowed in JSON.",
                "Plus signs are not allowed in JSON.",
                "Octal literals are not allowed in JSON.",
            ],
        },
        {
            code: "[0b1001,-0b1001,+0b1001]",
            output: "[9,-9,0b1001]",
            errors: [
                "Binary literals are not allowed in JSON.",
                "Binary literals are not allowed in JSON.",
                "Plus signs are not allowed in JSON.",
                "Binary literals are not allowed in JSON.",
            ],
        },
        {
            filename: "test.vue",
            code: `<custom-block lang="json">0x123</custom-block>`,
            output: `<custom-block lang="json">291</custom-block>`,
            parser: require.resolve("vue-eslint-parser"),
            errors: ["Hexadecimal literals are not allowed in JSON."],
        },
    ],
})
