import { RuleTester } from "eslint"
import rule from "../../../lib/rules/no-number-props"

const tester = new RuleTester({
    parser: require.resolve("../../../lib/parser/json-eslint-parser"),
})

tester.run("no-number-props", rule as any, {
    valid: ['{"key": 123}', "123", "[123]"],
    invalid: [
        {
            code: "{123: 123}",
            output: '{"123": 123}',
            errors: ["The number property keys are not allowed."],
        },
    ],
})
