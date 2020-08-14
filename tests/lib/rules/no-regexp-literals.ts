import { RuleTester } from "eslint"
import rule from "../../../lib/rules/no-regexp-literals"

const tester = new RuleTester({
    parser: require.resolve("jsonc-eslint-parser"),
})

tester.run("no-regexp-literals", rule as any, {
    valid: ['{"key": "value"}', '"string"', '["element"]'],
    invalid: [
        {
            code: "/reg/",
            errors: ["RegExp literals are not allowed."],
        },
        {
            code: "[/reg/, {'/val/': /reg/}]",
            errors: [
                "RegExp literals are not allowed.",
                "RegExp literals are not allowed.",
            ],
        },
    ],
})
