import { RuleTester } from "eslint"
import rule from "../../../lib/rules/array-bracket-newline"

const tester = new RuleTester({
    parser: require.resolve("jsonc-eslint-parser"),
})

tester.run("array-bracket-newline", rule as any, {
    valid: ["[]", "[\n1,\n2\n]"],
    invalid: [
        {
            code: "[\n1\n]",
            output: "[1]",
            errors: [
                "There should be no linebreak after '['.",
                "There should be no linebreak before ']'.",
            ],
        },
        {
            code: "[1,\n2]",
            output: "[\n1,\n2\n]",
            errors: [
                "A linebreak is required after '['.",
                "A linebreak is required before ']'.",
            ],
        },
    ],
})
