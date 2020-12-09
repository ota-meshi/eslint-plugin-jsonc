import { RuleTester } from "eslint"
import rule from "../../../lib/rules/no-number-props"

const tester = new RuleTester({
    parser: require.resolve("jsonc-eslint-parser"),
})

tester.run("no-number-props", rule as any, {
    valid: ['{"key": 123}', "{key: 123}", "123", "[123]"],
    invalid: [
        {
            code: "{123: 123}",
            output: '{"123": 123}',
            errors: ["The number property keys are not allowed."],
        },
        {
            code: `<custom-block lang="json">{123: 123}</custom-block>`,
            output: `<custom-block lang="json">{"123": 123}</custom-block>`,
            parser: require.resolve("vue-eslint-parser"),
            errors: ["The number property keys are not allowed."],
        },
    ],
})
