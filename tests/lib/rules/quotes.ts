import { RuleTester } from "eslint"
import rule from "../../../lib/rules/quotes"

const tester = new RuleTester({
    parser: require.resolve("jsonc-eslint-parser"),
})

tester.run("quotes", rule as any, {
    valid: ['{"key": "value"}', '"string"', '["element"]'],
    invalid: [
        {
            code: "{'key': 'value'}",
            output: '{"key": "value"}',
            errors: [
                "Strings must use doublequote.",
                "Strings must use doublequote.",
            ],
        },
        {
            filename: "test.json",
            code: "'string'",
            output: '"string"',
            errors: ["Strings must use doublequote."],
        },
        {
            code: "['element']",
            output: '["element"]',
            errors: ["Strings must use doublequote."],
        },
    ],
})
