import { RuleTester } from "eslint";
import rule from "../../../lib/rules/no-irregular-whitespace";

const tester = new RuleTester({
  parser: require.resolve("jsonc-eslint-parser"),
  parserOptions: {
    ecmaVersion: 2020,
  },
});

tester.run("no-irregular-whitespace", rule as any, {
  valid: [
    `"\u0020"`,
    `"\u0009"`,
    `"\\u000B"`,
    `["\u0009"]`,
    `["\\u000B"]`,
    `{"\u0009": "\u0009"}`,
    `{"\\u000B": "\\u000B"}`,

    // String
    `"\u000B"`,
    `["\u000B"]`,
    `{"\u000B": "\u000B"}`,
    {
      code: `"\u000B"`,
      options: [{ skipStrings: true }],
    },
    {
      code: `["\u000B"]`,
      options: [{ skipStrings: true }],
    },
    {
      code: `{"\u000B": "\u000B"}`,
      options: [{ skipStrings: true }],
    },
    // Templates
    {
      code: `\`\u000B\``,
      options: [{ skipTemplates: true }],
    },
    {
      code: `[\`\u000B\`]`,
      options: [{ skipTemplates: true }],
    },
    {
      code: `{"\u000B": \`\u000B\`}`,
      options: [{ skipTemplates: true }],
    },
    // RegExps
    {
      code: `/\u000B/`,
      options: [{ skipRegExps: true }],
    },
    {
      code: `[/\u000B/]`,
      options: [{ skipRegExps: true }],
    },
    {
      code: `{"\u000B": /\u000B/}`,
      options: [{ skipRegExps: true }],
    },
    // Comments
    {
      code: `{} // \u000B`,
      options: [{ skipComments: true }],
    },
  ],
  invalid: [
    {
      code: `{"\u000B": [\`\u000B\`, /\u000B/]} \u000B // \u000B`,
      errors: [
        {
          message: "Irregular whitespace not allowed.",
          line: 1,
          column: 9,
        },
        {
          message: "Irregular whitespace not allowed.",
          line: 1,
          column: 14,
        },
        {
          message: "Irregular whitespace not allowed.",
          line: 1,
          column: 19,
        },
        {
          message: "Irregular whitespace not allowed.",
          line: 1,
          column: 24,
        },
      ],
    },
    {
      code: `{"\u000B": [\`\u000B\`, /\u000B/]} \u000B // \u000B`,
      options: [
        {
          skipStrings: true,
          skipComments: true,
          skipRegExps: true,
          skipTemplates: true,
        },
      ],
      errors: [
        {
          message: "Irregular whitespace not allowed.",
          line: 1,
          column: 19,
        },
      ],
    },
    // String
    {
      code: `{"\u000B": "\u000B"}`,
      options: [{ skipStrings: false }],
      errors: [
        {
          message: "Irregular whitespace not allowed.",
          line: 1,
          column: 3,
        },
        {
          message: "Irregular whitespace not allowed.",
          line: 1,
          column: 8,
        },
      ],
    },
    {
      code: `["\u000B"]`,
      options: [{ skipStrings: false }],
      errors: [
        {
          message: "Irregular whitespace not allowed.",
          line: 1,
          column: 3,
        },
      ],
    },
    {
      code: `"\u000B"`,
      options: [{ skipStrings: false }],
      errors: [
        {
          message: "Irregular whitespace not allowed.",
          line: 1,
          column: 2,
        },
      ],
    },
    // Templates
    {
      code: `\`\u000B\``,
      options: [{ skipTemplates: false }],
      errors: [
        {
          message: "Irregular whitespace not allowed.",
          line: 1,
          column: 2,
        },
      ],
    },
    {
      code: `[\`\u000B\`]`,
      options: [{ skipTemplates: false }],
      errors: [
        {
          message: "Irregular whitespace not allowed.",
          line: 1,
          column: 3,
        },
      ],
    },
    {
      code: `{"\u000B": \`\u000B\`}`,
      options: [{ skipTemplates: false }],
      errors: [
        {
          message: "Irregular whitespace not allowed.",
          line: 1,
          column: 8,
        },
      ],
    },
    // RegExps
    {
      code: `/\u000B/`,
      options: [{ skipRegExps: false }],
      errors: [
        {
          message: "Irregular whitespace not allowed.",
          line: 1,
          column: 2,
        },
      ],
    },
    {
      code: `[/\u000B/]`,
      options: [{ skipRegExps: false }],
      errors: [
        {
          message: "Irregular whitespace not allowed.",
          line: 1,
          column: 3,
        },
      ],
    },
    {
      code: `{"\u000B": /\u000B/}`,
      options: [{ skipRegExps: false }],
      errors: [
        {
          message: "Irregular whitespace not allowed.",
          line: 1,
          column: 8,
        },
      ],
    },
    // Comments
    {
      code: `{} // \u000B`,
      options: [{ skipComments: false }],
      errors: [
        {
          message: "Irregular whitespace not allowed.",
          line: 1,
          column: 7,
        },
      ],
    },
  ],
});
