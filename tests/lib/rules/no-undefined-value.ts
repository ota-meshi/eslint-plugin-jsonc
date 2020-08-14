import { RuleTester } from "eslint"
import rule from "../../../lib/rules/no-undefined-value"

const tester = new RuleTester({
    parser: require.resolve("jsonc-eslint-parser"),
})

tester.run("no-undefined-value", rule as any, {
    valid: ["null", "[1,,2]", "{undefined:1}"],
    invalid: [
        {
            code: "undefined",
            errors: ["`undefined` is not allowed."],
        },
        {
            code: `[
                undefined,
                {
                    undefined: undefined
                }
            ]`,
            errors: [
                {
                    message: "`undefined` is not allowed.",
                    line: 2,
                    column: 17,
                    endColumn: 26,
                },
                {
                    message: "`undefined` is not allowed.",
                    line: 4,
                    column: 32,
                    endColumn: 41,
                },
            ],
        },
    ],
})
