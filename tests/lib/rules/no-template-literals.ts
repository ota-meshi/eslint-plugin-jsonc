import { RuleTester } from "eslint"
import rule from "../../../lib/rules/no-template-literals"

const tester = new RuleTester({
    parser: require.resolve("jsonc-eslint-parser"),
    parserOptions: {
        ecmaVersion: 2020,
    },
})

tester.run("no-template-literals", rule as any, {
    valid: ['{"key": "value"}', '"string"', '["element"]'],
    invalid: [
        {
            code: "`template`",
            output: '"template"',
            errors: ["The template literals are not allowed."],
        },
        {
            code: "[`template`]",
            output: '["template"]',
            errors: ["The template literals are not allowed."],
        },
        {
            code: '{"foo":`template`}',
            output: '{"foo":"template"}',
            errors: ["The template literals are not allowed."],
        },
        {
            code: "`temp\n\nlate`",
            output: '"temp\\n\\nlate"',
            errors: ["The template literals are not allowed."],
        },
        {
            code: `<custom-block lang="json">{"foo":\`template\`}</custom-block>`,
            output: `<custom-block lang="json">{"foo":"template"}</custom-block>`,
            parser: require.resolve("vue-eslint-parser"),
            errors: ["The template literals are not allowed."],
        },
    ],
})
