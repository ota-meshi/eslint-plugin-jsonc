import { RuleTester } from "eslint"
import rule from "../../../lib/rules/no-octal-numeric-literals"

const tester = new RuleTester({
    parser: require.resolve("jsonc-eslint-parser"),
    parserOptions: {
        ecmaVersion: 2020,
    },
})

tester.run("no-octal-numeric-literals", rule as any, {
    valid: ["0", "777"],
    invalid: [
        {
            code: `0o777`,
            output: `511`,
            errors: ["Octal numeric literals should not be used."],
        },
        {
            code: `0O777`,
            output: `511`,
            errors: ["Octal numeric literals should not be used."],
        },
    ],
})
