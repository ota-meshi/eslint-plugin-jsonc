import { RuleTester } from "eslint"
import rule from "../../../lib/rules/no-octal-escape"

const tester = new RuleTester({
    parser: require.resolve("jsonc-eslint-parser"),
})

tester.run("no-octal-escape", rule as any, {
    valid: ['{"GOOD": "Copyright \\u00A9"}'],
    invalid: [
        {
            code: '{"BAD": "Copyright \\251"}',
            errors: ["Don't use octal: '\\251'. Use '\\u....' instead."],
        },
    ],
})
