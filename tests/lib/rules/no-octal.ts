import { RuleTester } from "eslint"
import rule from "../../../lib/rules/no-octal"

const tester = new RuleTester({
    parser: require.resolve("jsonc-eslint-parser"),
    parserOptions: {
        ecmaVersion: 2020,
    },
})

tester.run("no-octal", rule as any, {
    valid: ["0", "1", "9"],
    invalid: [
        {
            code: `01`,
            errors: ["Octal literals should not be used."],
        },
        {
            code: `09`,
            errors: ["Octal literals should not be used."],
        },
    ],
})
