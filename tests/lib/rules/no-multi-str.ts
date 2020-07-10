import { RuleTester } from "eslint"
import rule from "../../../lib/rules/no-multi-str"

const tester = new RuleTester({
    parser: require.resolve("../../../lib/parser/json-eslint-parser"),
})

tester.run("no-multi-str", rule as any, {
    valid: ['{"GOOD": "Line 1 \\nLine 2"}', '"Line 1 \\nLine 2"'],
    invalid: [
        {
            code: '{"GOOD": "Line 1 \\\nLine 2"}',
            errors: ["Multiline support is limited to JSON5 only."],
        },
        {
            filename: "test.json",
            code: '"Line 1 \\\nLine 2"',
            errors: ["Multiline support is limited to JSON5 only."],
        },
    ],
})
