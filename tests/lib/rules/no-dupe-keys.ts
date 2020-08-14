import { RuleTester } from "eslint"
import rule from "../../../lib/rules/no-dupe-keys"

const tester = new RuleTester({
    parser: require.resolve("jsonc-eslint-parser"),
})

tester.run("no-dupe-keys", rule as any, {
    valid: ['{"key": "value"}', '{"key": "value", "key2": "value"}'],
    invalid: [
        {
            code: '{"key": "value", "key": "value"}',
            errors: ["Duplicate key 'key'."],
        },
    ],
})
