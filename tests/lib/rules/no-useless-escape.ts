import { RuleTester } from "eslint"
import rule from "../../../lib/rules/no-useless-escape"

const tester = new RuleTester({
    parser: require.resolve("../../../lib/parser/json-eslint-parser"),
})

tester.run("no-useless-escape", rule as any, {
    valid: ['"\\""'],
    invalid: [
        {
            filename: "test.json",
            code: '"hol\\a"',
            errors: ["Unnecessary escape character: \\a."],
        },
    ],
})
