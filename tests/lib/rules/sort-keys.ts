import { RuleTester } from "eslint"
import rule from "../../../lib/rules/sort-keys"

const tester = new RuleTester({
    parser: require.resolve("../../../lib/parser/json-eslint-parser"),
})

tester.run("sort-keys", rule as any, {
    valid: ['{"a": 1, "b": 2, "c": 3}'],
    invalid: [
        {
            code: '{"a": 1, "c": 3, "b": 2}',
            errors: [
                "Expected object keys to be in ascending order. 'b' should be before 'c'.",
            ],
        },
    ],
})
