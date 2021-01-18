import { RuleTester } from "eslint"
import rule from "../../../lib/rules/object-curly-spacing"

const tester = new RuleTester({
    parser: require.resolve("jsonc-eslint-parser"),
})

tester.run("object-curly-spacing", rule as any, {
    valid: ['{"key": "value"}'],
    invalid: [
        {
            code: '{ "key": "value" }',
            output: '{"key": "value"}',
            errors: [
                "There should be no space after '{'.",
                "There should be no space before '}'.",
            ],
        },
        {
            filename: "test.vue",
            code: `<custom-block lang="json">{ "key": "value" }</custom-block>`,
            output: `<custom-block lang="json">{"key": "value"}</custom-block>`,
            parser: require.resolve("vue-eslint-parser"),
            errors: [
                "There should be no space after '{'.",
                "There should be no space before '}'.",
            ],
        },
    ],
})
