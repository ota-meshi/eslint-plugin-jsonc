import { RuleTester } from "eslint"
import rule from "../../../lib/rules/array-bracket-spacing"

const tester = new RuleTester({
    parser: require.resolve("../../../lib/parser/json-eslint-parser"),
})

tester.run("array-bracket-spacing", rule as any, {
    valid: ['["element"]'],
    invalid: [
        {
            code: '[ "element" ]',
            output: '["element"]',
            errors: [
                "There should be no space after '['.",
                "There should be no space before ']'.",
            ],
        },
    ],
})
