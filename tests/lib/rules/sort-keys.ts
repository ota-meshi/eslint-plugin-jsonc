import fs from "fs";
import { RuleTester } from "../test-lib/tester";
import rule from "../../../lib/rules/sort-keys";
import * as jsonParser from "jsonc-eslint-parser";
import * as vueParser from "vue-eslint-parser";

const tester = new RuleTester({
  languageOptions: {
    parser: jsonParser,
  },
});

const OPTIONS_FOR_PACKAGE_JSON = [
  {
    pathPattern: "^$",
    order: [
      "name",
      "version",
      "dependencies",
      "peerDependencies",
      "devDependencies",
      "optionalDependencies",
      "bundledDependencies",
    ],
  },
  {
    pathPattern: "^(?:dev|peer|optional|bundled)?[Dd]ependencies$",
    order: {
      type: "asc",
    },
  },
  {
    pathPattern: "^eslintConfig$",
    order: ["root", "plugins", "extends"],
  },
];

const OPTIONS_FOR_JSON_SCHEMA = [
  {
    pathPattern: ".*",
    hasProperties: ["type"],
    order: [
      "type",
      "properties",
      "items",
      "required",
      "minItems",
      "additionalProperties",
      "additionalItems",
    ],
  },
];

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

    // package.json
    {
      code: fs.readFileSync(require.resolve("../../../package.json"), "utf-8"),
      options: OPTIONS_FOR_PACKAGE_JSON,
    },

    // JSON Schema
    {
      code: JSON.stringify(rule.meta.schema),
      options: OPTIONS_FOR_JSON_SCHEMA,
    },

    // nest
    {
      code: `
            {
                "a":1,
                "b":2,
                "c":3,
                "d":4,
                "e":5,
                "f":6,
                "g":7,
                "z":26
            }
            `,
      options: [
        {
          pathPattern: "^$",
          order: [
            "a",
            "b",
            {
              keyPattern: "[cd]",
              order: { type: "asc" },
            },
            {
              keyPattern: "[e-g]",
              order: { type: "asc" },
            },
            "z",
          ],
        },
      ],
    },
    {
      code: `
            {
                "a":1,
                "b":2,
                "c":3,
                "d":4,
                "e":5,
                "f":6,
                "g":7,
                "z":26
            }
            `,
      options: [
        {
          pathPattern: "^$",
          order: [
            "a",
            "b",
            {
              order: { type: "asc" },
            },
            "z",
          ],
        },
      ],
    },

    // allowLineSeparatedGroups option
    {
      code: `
      {
        "e": 1,
        "f": 2,
        "g": 3,

        "a": 4,
        "b": 5,
        "c": 6
      }`,
      options: ["asc", { allowLineSeparatedGroups: true }],
    },
    {
      code: `
      {
        "b": 1,

        // comment
        "a": 2,
        "c": 3
      }`,
      options: ["asc", { allowLineSeparatedGroups: true }],
    },
    {
      code: `
      {
        "b": 1

        ,

        // comment
        "a": 2,
        "c": 3
      }`,
      options: ["asc", { allowLineSeparatedGroups: true }],
    },
    {
      code: `
      {
        "c": 1,
        "d": 2,

        "b": {
        },
        "e": 4
      }`,
      options: ["asc", { allowLineSeparatedGroups: true }],
    },
    {
      code: `
      {
        "c": 1,
        "d": 2,
        // comment

        // comment
        "b": {
        },
        "e": 4
      }`,
      options: ["asc", { allowLineSeparatedGroups: true }],
    },
    {
      code: `
      {
        "c": 1,
        "d": 2,

        "a": {

        },

        // abce
        "f": 3,

        /*

        */
        "ab": 1,
        "cc": 1,
        "e": 2
      }`,
      options: ["asc", { allowLineSeparatedGroups: true }],
    },
    {
      code: `
      {
        "b": "/*",

        "a": "*/",
      }`,
      options: ["asc", { allowLineSeparatedGroups: true }],
    },
    {
      code: `
      {
        "b": 42,
        /*
        */ //

        "a": 42
      }`,
      options: ["asc", { allowLineSeparatedGroups: true }],
    },
    {
      code: `
      {
        "b": 42,

        /*
        */ //
        "a": 42
      }`,
      options: ["asc", { allowLineSeparatedGroups: true }],
    },
    {
      code: `
      {
        "b": 1

        ,"a": 2
      }`,
      options: ["asc", { allowLineSeparatedGroups: true }],
    },
    {
      code: `
      {
          "b": 1
      // comment before comma

      ,
      "a": 2
      }`,
      options: ["asc", { allowLineSeparatedGroups: true }],
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
      filename: "test.vue",
      code: `<custom-block lang="json">{a:1, A: 2, B:3, b:4}</custom-block>`,
      output: `<custom-block lang="json">{ A: 2,a:1, B:3, b:4}</custom-block>`,
      errors: [
        "Expected object keys to be in ascending order. 'A' should be before 'a'.",
      ],
      ...({
        languageOptions: {
          parser: vueParser,
        },
      } as any),
    },
    // package.json
    {
      code: `
            {
                "version": "0.0.0",
                "name": "test",
                "eslintConfig": {
                    "root": true,
                    "extends": [],
                    "plugins": [],
                },
                "dependencies": {
                    "b": "0.0.1",
                    "a": "0.0.1"
                }
            }`,
      output: `
            {
                "name": "test",
                "version": "0.0.0",
                "eslintConfig": {
                    "root": true,
                    "plugins": [],
                    "extends": [],
                },
                "dependencies": {
                    "a": "0.0.1",
                    "b": "0.0.1"
                }
            }`,
      options: OPTIONS_FOR_PACKAGE_JSON,
      errors: [
        "Expected object keys to be in specified order. 'name' should be before 'version'.",
        "Expected object keys to be in specified order. 'plugins' should be before 'extends'.",
        "Expected object keys to be in ascending order. 'a' should be before 'b'.",
      ],
    },

    // JSON Schema
    {
      code: `
            {
                "type": "object",
                "additionalProperties": false,
                "properties": {
                    "foo": {
                        "minItems": 2,
                        "type": "array"
                    }
                }
            }`,
      output: `
            {
                "type": "object",
                "properties": {
                    "foo": {
                        "minItems": 2,
                        "type": "array"
                    }
                },
                "additionalProperties": false
            }`,
      options: OPTIONS_FOR_JSON_SCHEMA,
      errors: [
        "Expected object keys to be in specified order. 'properties' should be before 'additionalProperties'.",
        "Expected object keys to be in specified order. 'type' should be before 'minItems'.",
      ],
    },
    {
      code: `
            {
                "type": "object",
                "properties": {
                    "foo": {
                        "minItems": 2,
                        "type": "array"
                    }
                },
                "additionalProperties": false
            }`,
      output: `
            {
                "type": "object",
                "properties": {
                    "foo": {
                        "type": "array",
                        "minItems": 2
                    }
                },
                "additionalProperties": false
            }`,
      options: OPTIONS_FOR_JSON_SCHEMA,
      errors: [
        "Expected object keys to be in specified order. 'type' should be before 'minItems'.",
      ],
    },

    // Other
    {
      code: `
            {
                "\t": {
                    "b": 42,
                    "a": 42,
                },
                "arr": [
                    {
                        "d": 42,
                        "c": 42,
                    },
                    {
                        "f": 42,
                        "e": 42,
                    },
                ]
            }`,
      output: `
            {
                "\t": {
                    "a": 42,
                    "b": 42,
                },
                "arr": [
                    {
                        "d": 42,
                        "c": 42,
                    },
                    {
                        "e": 42,
                        "f": 42,
                    },
                ]
            }`,
      options: [
        {
          pathPattern: '^\\["\\\\t"\\]$',
          order: { type: "asc" },
        },
        {
          pathPattern: "^arr\\[1\\]$",
          order: { type: "asc" },
        },
      ],
      errors: [
        "Expected object keys to be in ascending order. 'a' should be before 'b'.",
        "Expected object keys to be in ascending order. 'e' should be before 'f'.",
      ],
    },

    // nest
    {
      code: `
            {
                "a":1,
                "b":2,
                "d":4,
                "c":3,
                "e":5,
                "g":7,
                "f":6,
                "z":26
            }
            `,
      output: `
            {
                "a":1,
                "b":2,
                "c":3,
                "d":4,
                "e":5,
                "f":6,
                "g":7,
                "z":26
            }
            `,
      options: [
        {
          pathPattern: "^$",
          order: [
            "a",
            "b",
            {
              keyPattern: "[cd]",
              order: { type: "asc" },
            },
            {
              keyPattern: "[e-g]",
              order: { type: "asc" },
            },
            "z",
          ],
        },
      ],
      errors: [
        "Expected object keys to be in specified order. 'c' should be before 'd'.",
        "Expected object keys to be in specified order. 'f' should be before 'g'.",
      ],
    },
    {
      code: `
            {
                "a":1,
                "b":2,
                "z":26,
                "c":3,
                "d":4,
                "e":5,
                "f":6,
                "g":7
            }
            `,
      output: `
            {
                "a":1,
                "b":2,
                "c":3,
                "z":26,
                "d":4,
                "e":5,
                "f":6,
                "g":7
            }
            `,
      options: [
        {
          pathPattern: "^$",
          order: [
            "a",
            "b",
            {
              keyPattern: "[cd]",
              order: { type: "asc" },
            },
            {
              keyPattern: "[e-g]",
              order: { type: "asc" },
            },
            "z",
          ],
        },
      ],
      errors: [
        "Expected object keys to be in specified order. 'c' should be before 'z'.",
      ],
    },
    {
      code: `
            {
                "a":1,
                "b":2,
                "c":3,
                "d":4,
                "z":26,
                "e":5,
                "f":6,
                "g":7
            }
            `,
      output: `
            {
                "a":1,
                "b":2,
                "c":3,
                "d":4,
                "e":5,
                "z":26,
                "f":6,
                "g":7
            }
            `,
      options: [
        {
          pathPattern: "^$",
          order: [
            "a",
            "b",
            {
              keyPattern: "[cd]",
              order: { type: "asc" },
            },
            {
              keyPattern: "[e-g]",
              order: { type: "asc" },
            },
            "z",
          ],
        },
      ],
      errors: [
        "Expected object keys to be in specified order. 'e' should be before 'z'.",
      ],
    },

    // When allowLineSeparatedGroups option is false
    {
      code: `
      {
          "b": 1,
          "c": 2,
          "a": 3
      }`,
      output: `
      {
          "a": 3,
          "b": 1,
          "c": 2
      }`,
      options: ["asc", { allowLineSeparatedGroups: false }],
      errors: [
        {
          message:
            "Expected object keys to be in ascending order. 'a' should be before 'c'.",
          line: 5,
          column: 11,
        },
      ],
    },
    {
      code: `
      {
        "b": 42

        ,"a": 42
      }`,
      output: `
      {

        "a": 42,
        "b": 42
      }`,
      options: ["asc", { allowLineSeparatedGroups: false }],
      errors: [
        {
          message:
            "Expected object keys to be in ascending order. 'a' should be before 'b'.",
          line: 5,
          column: 10,
        },
      ],
    },

    // When allowLineSeparatedGroups option is true
    {
      code: `
      {
        "b": 1,
        "c": {

        },
        "a": 3
      }`,
      output: `
      {
        "a": 3,
        "b": 1,
        "c": {

        }
      }`,
      options: ["asc", { allowLineSeparatedGroups: true }],
      errors: [
        {
          message:
            "Expected object keys to be in ascending order. 'a' should be before 'c'.",
          line: 7,
          column: 9,
        },
      ],
    },
    {
      code: `
      {
        "a": 1,
        "b": 2,

        "z": {

        },
        "y": 3
      }`,
      output: `
      {
        "a": 1,
        "b": 2,

        "y": 3,
        "z": {

        }
      }`,
      options: ["asc", { allowLineSeparatedGroups: true }],
      errors: [
        {
          message:
            "Expected object keys to be in ascending order. 'y' should be before 'z'.",
          line: 9,
          column: 9,
        },
      ],
    },
    {
      code: `
      {
        "b": 1,
        "c": {
        },
        // comment
        "a": 3
      }`,
      output: `
      {
        // comment
        "a": 3,
        "b": 1,
        "c": {
        }
      }`,
      options: ["asc", { allowLineSeparatedGroups: true }],
      errors: [
        {
          message:
            "Expected object keys to be in ascending order. 'a' should be before 'c'.",
          line: 7,
          column: 9,
        },
      ],
    },
    {
      code: `
      {
        "b": 42,
        "ab": 1,
        "a": 42 // sort-keys: 'a' should be before 'b'
      }`,
      output: `
      {
        "ab": 1,
        "b": 42,
        "a": 42 // sort-keys: 'a' should be before 'b'
      }`,
      options: ["asc", { allowLineSeparatedGroups: true }],
      errors: [
        {
          message:
            "Expected object keys to be in ascending order. 'ab' should be before 'b'.",
          line: 4,
          column: 9,
        },
        {
          message:
            "Expected object keys to be in ascending order. 'a' should be before 'ab'.",
          line: 5,
          column: 9,
        },
      ],
    },
    {
      code: `
      {
        "c": 1,
        "d": 2,
        // comment
        // comment
        "b": {
        },
        "e": 4
      }`,
      output: `
      {
        // comment
        // comment
        "b": {
        },
        "c": 1,
        "d": 2,
        "e": 4
      }`,
      options: ["asc", { allowLineSeparatedGroups: true }],
      errors: [
        {
          message:
            "Expected object keys to be in ascending order. 'b' should be before 'd'.",
          line: 7,
          column: 9,
        },
      ],
    },
    {
      code: `
      {
        "c": 1,
        "d": 2,

        "z": {

        },
        "f": 3,
        /*

        */
        "ab": 1,
        "b": 1,
        "e": 2
      }`,
      output: `
      {
        "c": 1,
        "d": 2,

        "f": 3,
        "z": {

        },
        /*

        */
        "ab": 1,
        "b": 1,
        "e": 2
      }`,
      options: ["asc", { allowLineSeparatedGroups: true }],
      errors: [
        {
          message:
            "Expected object keys to be in ascending order. 'f' should be before 'z'.",
          line: 9,
          column: 9,
        },
        {
          message:
            "Expected object keys to be in ascending order. 'ab' should be before 'f'.",
          line: 13,
          column: 9,
        },
      ],
    },
    {
      code: `
      {
        "b": "/*",
        "a": "*/",
      }`,
      output: `
      {
        "a": "*/",
        "b": "/*",
      }`,
      options: ["asc", { allowLineSeparatedGroups: true }],
      errors: [
        {
          message:
            "Expected object keys to be in ascending order. 'a' should be before 'b'.",
          line: 4,
          column: 9,
        },
      ],
    },
    {
      code: `
      {
        "b": 1
        // comment before comma
        , "a": 2
      }`,
      output: `
      {
        // comment before comma
         "a": 2,
        "b": 1
      }`,
      options: ["asc", { allowLineSeparatedGroups: true }],
      errors: [
        {
          message:
            "Expected object keys to be in ascending order. 'a' should be before 'b'.",
          line: 5,
          column: 11,
        },
      ],
    },
    {
      code: `
      {
        "b": 42,
        "foo": [
        // ↓ this blank is inside a property and therefore should not count

        ],
        "a": 42
      }`,
      output: `
      {
        "a": 42,
        "b": 42,
        "foo": [
        // ↓ this blank is inside a property and therefore should not count

        ]
      }`,
      options: ["asc", { allowLineSeparatedGroups: true }],
      errors: [
        {
          message:
            "Expected object keys to be in ascending order. 'a' should be before 'foo'.",
          line: 8,
          column: 9,
        },
      ],
    },
    {
      code: `
      {
        "compilerOptions": {
          "target": "esnext", /* Set the JavaScript language version for emitted JavaScript and include compatible library declarations. */
          "strict": true /* Enable all strict type-checking options. */
        }
      }`,
      output: `
      {
        "compilerOptions": {
          "strict": true, /* Enable all strict type-checking options. */
          "target": "esnext" /* Set the JavaScript language version for emitted JavaScript and include compatible library declarations. */
        }
      }`,
      options: ["asc"],
      errors: [
        {
          message:
            "Expected object keys to be in ascending order. 'strict' should be before 'target'.",
          line: 5,
        },
      ],
    },
    {
      code: `
      {
        "b": "foo"
        , /* comment */
        "a": "bar" // comment
      }`,
      output: `
      { /* comment */
        "a": "bar", // comment
        "b": "foo"
        
      }`,
      options: ["asc"],
      errors: [
        "Expected object keys to be in ascending order. 'a' should be before 'b'.",
      ],
    },
    {
      code: `
      { "b": "foo" /* c1 */ , /* c2 */ "a": "bar" /* c3 */ }`,
      output: `
      { /* c2 */ "a": "bar", /* c3 */ "b": "foo" /* c1 */  }`,
      options: ["asc"],
      errors: [
        "Expected object keys to be in ascending order. 'a' should be before 'b'.",
      ],
    },
    {
      code: `
      {
        "b": "foo" /* c1 */ , /* c2 */ "a": "bar" // comment
      }`,
      output: `
      { /* c2 */ "a": "bar", // comment
        "b": "foo" /* c1 */ 
      }`,
      options: ["asc"],
      errors: [
        "Expected object keys to be in ascending order. 'a' should be before 'b'.",
      ],
    },
  ],
});
