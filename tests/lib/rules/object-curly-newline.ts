import { RuleTester } from "eslint"
import rule from "../../../lib/rules/object-curly-newline"

const tester = new RuleTester({
    parser: require.resolve("jsonc-eslint-parser"),
})

tester.run("object-curly-newline", rule as any, {
    valid: ['{"key": "value"}', '{\n"key": "value"\n}'],
    invalid: [
        {
            code: '{\n"key": "value"}',
            output: '{"key": "value"}',
            errors: ["Unexpected line break after this opening brace."],
        },
        {
            code: `<custom-block lang="json">{\n"key": "value"}</custom-block>`,
            output: `<custom-block lang="json">{"key": "value"}</custom-block>`,
            parser: require.resolve("vue-eslint-parser"),
            errors: ["Unexpected line break after this opening brace."],
        },
    ],
})
