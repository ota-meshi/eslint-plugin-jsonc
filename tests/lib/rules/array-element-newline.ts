import { RuleTester } from "eslint"
import rule from "../../../lib/rules/array-element-newline"

const tester = new RuleTester({
    parser: require.resolve("jsonc-eslint-parser"),
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
        {
            filename: "test.vue",
            code: `<i18n>[1, 2, 3]</i18n><custom-block lang="json5">[1, 2, 3]</custom-block>`,
            output: `<i18n>[1,
2,
3]</i18n><custom-block lang="json5">[1,
2,
3]</custom-block>`,
            parser: require.resolve("vue-eslint-parser"),
            errors: [
                "There should be a linebreak after this element.",
                "There should be a linebreak after this element.",
                "There should be a linebreak after this element.",
                "There should be a linebreak after this element.",
            ],
        },
    ],
})
