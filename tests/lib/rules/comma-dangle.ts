import { RuleTester, Linter } from "eslint"
import rule from "../../../lib/rules/comma-dangle"
import semver from "semver"

const tester = new RuleTester({
    parser: require.resolve("jsonc-eslint-parser"),
})

tester.run("comma-dangle", rule as any, {
    valid: ['{"key": "value"}'],
    invalid: [
        {
            code: '{"key": "value",}',
            output: '{"key": "value"}',
            errors: ["Unexpected trailing comma."],
        },
        {
            code: '{"key": [1,2],}',
            output: semver.gte(Linter.version, "8.11.0")
                ? '{"key": [1,2,],}'
                : '{"key": [1,2,]}',
            options: [{ arrays: "always", objects: "never" }],
            errors: ["Missing trailing comma.", "Unexpected trailing comma."],
        },
        {
            filename: "test.vue",
            code: `<i18n>{"key": "value",}</i18n><custom-block>{"key": "value",}</custom-block>`,
            output: `<i18n>{"key": "value"}</i18n><custom-block>{"key": "value",}</custom-block>`,
            parser: require.resolve("vue-eslint-parser"),
            errors: ["Unexpected trailing comma."],
        },
    ],
})
