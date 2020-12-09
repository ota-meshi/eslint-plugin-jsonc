import { RuleTester } from "eslint"
import rule from "../../../lib/rules/sort-keys"

const tester = new RuleTester({
    parser: require.resolve("jsonc-eslint-parser"),
})

tester.run("sort-keys", rule as any, {
    valid: [
        '{"a": 1, "b": 2, "c": 3}',

        // natural
        { code: "{$:1, _:2, A:3, a:4}", options: ["asc", { natural: true }] },

        // caseSensitive: false
        {
            code: "{a:1, A: 2, B:3, b:4}",
            options: ["asc", { caseSensitive: false }],
        },

        {
            code: '{"c": 1, "b": 2, "a": 3}',
            options: ["desc"],
        },
    ],
    invalid: [
        {
            code: '{"a": 1, "c": 3, "b": 2}',
            output: '{"a": 1, "b": 2, "c": 3}',
            errors: [
                "Expected object keys to be in ascending order. 'b' should be before 'c'.",
            ],
        },
        {
            code: '{a: 1, c: 3, d: 4, "b": 2}',
            output: '{a: 1, "b": 2, c: 3, d: 4}',
            errors: [
                "Expected object keys to be in ascending order. 'b' should be before 'd'.",
            ],
        },
        {
            code: '{f: {a: 1, c: 3, d: 4, "b": 2}, e: 5}',
            output: '{ e: 5,f: {a: 1, c: 3, d: 4, "b": 2}}',
            errors: [
                "Expected object keys to be in ascending order. 'b' should be before 'd'.",
                "Expected object keys to be in ascending order. 'e' should be before 'f'.",
            ],
        },
        {
            code: '{"a": 1, /*c*/"c": 3,/*b*/ "b": 2,}',
            output: '{"a": 1,/*b*/ "b": 2, /*c*/"c": 3,}',
            errors: [
                "Expected object keys to be in ascending order. 'b' should be before 'c'.",
            ],
        },
        {
            code: "{$:1, _:2, A:3, a:4}",
            output: "{$:1, A:3, _:2, a:4}",
            errors: [
                "Expected object keys to be in ascending order. 'A' should be before '_'.",
            ],
        },
        {
            code: "{$:1, A:3, _:2, a:4}",
            output: "{$:1, _:2, A:3, a:4}",
            options: ["asc", { natural: true }],
            errors: [
                "Expected object keys to be in natural ascending order. '_' should be before 'A'.",
            ],
        },

        {
            code: "{a:1, A: 2, B:3, b:4}",
            output: "{ A: 2,a:1, B:3, b:4}",
            errors: [
                "Expected object keys to be in ascending order. 'A' should be before 'a'.",
            ],
        },
        {
            code: "{a:1, B:3, b:4, A: 2, c: 5, C: 6}",
            output: "{a:1, A: 2, B:3, b:4, c: 5, C: 6}",
            options: ["asc", { caseSensitive: false }],
            errors: [
                "Expected object keys to be in insensitive ascending order. 'A' should be before 'b'.",
            ],
        },
        {
            code: '{"a": 1, "b": 2, "c": 3}',
            output: '{ "b": 2,"a": 1, "c": 3}',
            options: ["desc"],
            errors: [
                "Expected object keys to be in descending order. 'b' should be before 'a'.",
                "Expected object keys to be in descending order. 'c' should be before 'b'.",
            ],
        },
        {
            code: `<custom-block lang="json">{a:1, A: 2, B:3, b:4}</custom-block>`,
            output: `<custom-block lang="json">{ A: 2,a:1, B:3, b:4}</custom-block>`,
            parser: require.resolve("vue-eslint-parser"),
            errors: [
                "Expected object keys to be in ascending order. 'A' should be before 'a'.",
            ],
        },
    ],
})
