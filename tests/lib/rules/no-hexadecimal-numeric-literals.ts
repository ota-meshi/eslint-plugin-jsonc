import { RuleTester } from "eslint"
import rule from "../../../lib/rules/no-hexadecimal-numeric-literals"

const tester = new RuleTester({
    parser: require.resolve("jsonc-eslint-parser"),
    parserOptions: {
        ecmaVersion: 2020,
    },
})

tester.run("no-hexadecimal-numeric-literals", rule as any, {
    valid: ["0", "777", '"FFF"'],
    invalid: [
        {
            code: `0x777`,
            output: `1911`,
            errors: ["Hexadecimal numeric literals should not be used."],
        },
        {
            code: `0X777`,
            output: `1911`,
            errors: ["Hexadecimal numeric literals should not be used."],
        },
        {
            code: `0xFFFF`,
            output: `65535`,
            errors: ["Hexadecimal numeric literals should not be used."],
        },
    ],
})
