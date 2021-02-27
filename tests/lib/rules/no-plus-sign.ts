import { RuleTester } from "eslint"
import rule from "../../../lib/rules/no-plus-sign"

const tester = new RuleTester({
    parser: require.resolve("jsonc-eslint-parser"),
    parserOptions: {
        ecmaVersion: 2020,
    },
})

tester.run("no-plus-sign", rule as any, {
    valid: ["42", "-42", "-42.0"],
    invalid: [
        {
            code: `+42`,
            output: `42`,
            errors: ["Plus sign should not be used."],
        },
        {
            code: `+ 42`,
            output: ` 42`,
            errors: ["Plus sign should not be used."],
        },
    ],
})
