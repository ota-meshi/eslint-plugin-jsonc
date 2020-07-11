import { RuleTester } from "eslint"
import rule from "../../../lib/rules/key-spacing"

const tester = new RuleTester({
    parser: require.resolve("../../../lib/parser/json-eslint-parser"),
})

tester.run("key-spacing", rule as any, {
    valid: ['{"key": "value"}'],
    invalid: [
        {
            code: '{"key" :"value"}',
            output: '{"key": "value"}',
            errors: [
                "Extra space after key 'key'.",
                "Missing space before value for key 'key'.",
            ],
        },
    ],
})
