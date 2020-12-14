import { RuleTester } from "eslint"
import rule from "../../../lib/rules/no-multi-str"

const tester = new RuleTester({
    parser: require.resolve("jsonc-eslint-parser"),
})

tester.run("no-multi-str", rule as any, {
    valid: ['{"GOOD": "Line 1 \\nLine 2"}', '"Line 1 \\nLine 2"'],
    invalid: [
        {
            code: '{"GOOD": "Line 1 \\\nLine 2"}',
            errors: 1, // FIXME:  drop supports eslint6 ["Multiline support is limited to JSON5 only."],
        },
        {
            filename: "test.json",
            code: '"Line 1 \\\nLine 2"',
            errors: 1, // FIXME:  drop supports eslint6 ["Multiline support is limited to JSON5 only."],
        },
        {
            code: `<custom-block lang="json">"Line 1 \\\nLine 2"</custom-block>`,
            parser: require.resolve("vue-eslint-parser"),
            errors: 1, // FIXME:  drop supports eslint6 ["Multiline support is limited to JSON5 only."],
        },
    ],
})
