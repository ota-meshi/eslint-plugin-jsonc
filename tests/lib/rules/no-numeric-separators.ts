import { RuleTester } from "eslint"
import rule from "../../../lib/rules/no-numeric-separators"
import { Linter } from "eslint"
import semver from "semver"
if (!semver.gte(Linter.version, "7.3.0")) {
    // @ts-expect-error
    return
}
const tester = new RuleTester({
    parser: require.resolve("jsonc-eslint-parser"),
    parserOptions: {
        ecmaVersion: 2021,
    },
})

tester.run("no-numeric-separators", rule as any, {
    valid: ['{"key": 1234}', "1234", "[1234]"],
    invalid: [
        {
            code: `{"key": 1_234}`,
            output: `{"key": 1234}`,
            errors: ["Numeric separators are not allowed."],
        },
        {
            code: `1_234`,
            output: `1234`,
            errors: ["Numeric separators are not allowed."],
        },
        {
            code: `[1_234]`,
            output: `[1234]`,
            errors: ["Numeric separators are not allowed."],
        },
    ],
})
