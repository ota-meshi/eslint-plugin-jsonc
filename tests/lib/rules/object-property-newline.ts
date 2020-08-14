import { RuleTester } from "eslint"
import rule from "../../../lib/rules/object-property-newline"

const tester = new RuleTester({
    parser: require.resolve("jsonc-eslint-parser"),
})

tester.run("object-property-newline", rule as any, {
    valid: [
        `
        {
            "foo": "foo",
            "bar": "bar",
            "baz": "baz"
        }
        `,
    ],
    invalid: [
        {
            code: `
            {
                "foo": "foo", "bar": "bar", "baz": "baz"
            }`,
            output: `
            {
                "foo": "foo",
"bar": "bar",
"baz": "baz"
            }`,
            errors: [
                "Object properties must go on a new line.",
                "Object properties must go on a new line.",
            ],
        },
    ],
})
