import { RuleTester } from "eslint"
import rule from "../../../lib/rules/array-element-newline"

const tester = new RuleTester({
    parser: require.resolve("../../../lib/parser/json-eslint-parser"),
})

tester.run("array-element-newline", rule as any, {
    valid: [
        `[1,
            2,
            3]`,
    ],
    invalid: [
        {
            code: "[1, 2, 3]",
            output: `[1,
2,
3]`,
            errors: [
                "There should be a linebreak after this element.",
                "There should be a linebreak after this element.",
            ],
        },
    ],
})
