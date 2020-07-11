import { RuleTester } from "eslint"
import rule from "../../../lib/rules/comma-dangle"

const tester = new RuleTester({
    parser: require.resolve("../../../lib/parser/json-eslint-parser"),
})

tester.run("comma-dangle", rule as any, {
    valid: ['{"key": "value"}'],
    invalid: [
        {
            code: '{"key": "value",}',
            output: '{"key": "value"}',
            errors: ["Unexpected trailing comma."],
        },
        {
            code: '{"key": [1,2],}',
            output: '{"key": [1,2,]}',
            options: [{ arrays: "always", objects: "never" }],
            errors: ["Missing trailing comma.", "Unexpected trailing comma."],
        },
    ],
})
