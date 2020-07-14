import { RuleTester } from "eslint"
import rule from "../../../lib/rules/no-sparse-arrays"

const tester = new RuleTester({
    parser: require.resolve("../../../lib/parser/json-eslint-parser"),
})

tester.run("no-sparse-arrays", rule as any, {
    valid: ["[1,2,3,4]", "[1,2,3,4,]"],
    invalid: [
        {
            code: "[1,,,4]",
            errors: ["Unexpected comma in middle of array."],
        },
        {
            code: "[,2,3,4]",
            errors: ["Unexpected comma in middle of array."],
        },
    ],
})
