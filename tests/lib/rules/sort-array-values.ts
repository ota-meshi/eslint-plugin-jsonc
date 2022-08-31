import { RuleTester } from "eslint";
import rule from "../../../lib/rules/sort-array-values";

const tester = new RuleTester({
  parser: require.resolve("jsonc-eslint-parser"),
  parserOptions: {
    ecmaVersion: 2020,
  },
});

tester.run("sort-array-values", rule as any, {
  valid: [
    {
      code: '{"key": ["a", "b", "c"] }',
      options: [{ pathPattern: "^key$", order: { type: "asc" } }],
    },
    {
      code: '{"key": ["c", "b", "a"] }',
      options: [{ pathPattern: "^key$", order: { type: "desc" } }],
    },
    {
      code: '{"key": ["c", "a", "b"] }',
      options: [{ pathPattern: "^key$", order: ["c", "a", "b"] }],
    },
    {
      code: '{"key": ["c", "z", "a", "x", "b", "y"] }',
      options: [{ pathPattern: "^key$", order: ["c", "a", "b"] }],
    },
    {
      code: '{"key": [ "c","a", "b", "x", "y", "z"] }',
      options: [
        {
          pathPattern: "^key$",
          order: ["c", "a", "b", { order: { type: "asc" } }],
        },
      ],
    },
    {
      code: '{"not target": ["c", "b", "a"] }',
      options: [{ pathPattern: "^key$", order: { type: "asc" } }],
    },
    {
      code: '{"key": ["A", "a", "b", "B"] }',
      options: [
        {
          pathPattern: "^key$",
          order: { type: "asc", caseSensitive: false },
        },
      ],
    },
    {
      code: '{"key": [["b"], ["a"], "c"] }',
      options: [{ pathPattern: "^key$", order: { type: "asc" } }],
    },
  ],
  invalid: [
    {
      code: '{"key": ["c", "b", "a"] }',
      output: '{"key": [ "b","c", "a"] }',
      options: [{ pathPattern: "^key$", order: { type: "asc" } }],
      errors: [
        {
          message:
            "Expected array values to be in ascending order. 'b' should be before 'c'.",
          line: 1,
          column: 15,
        },
        {
          message:
            "Expected array values to be in ascending order. 'a' should be before 'b'.",
          line: 1,
          column: 20,
        },
      ],
    },
    {
      code: '{"key": ["a", "b", "c"] }',
      output: '{"key": [ "b","a", "c"] }',
      options: [{ pathPattern: "^key$", order: { type: "desc" } }],
      errors: [
        {
          message:
            "Expected array values to be in descending order. 'b' should be before 'a'.",
          line: 1,
          column: 15,
        },
        {
          message:
            "Expected array values to be in descending order. 'c' should be before 'b'.",
          line: 1,
          column: 20,
        },
      ],
    },
    {
      code: '{"key": ["b", "a", "c"] }',
      output: '{"key": [ "a","b", "c"] }',
      options: [{ pathPattern: "^key$", order: ["c", "a", "b"] }],
      errors: [
        {
          message:
            "Expected array values to be in specified order. 'a' should be before 'b'.",
          line: 1,
          column: 15,
        },
        {
          message:
            "Expected array values to be in specified order. 'c' should be before 'a'.",
          line: 1,
          column: 20,
        },
      ],
    },
    {
      code: '{"key": ["a", "b", "c"] }',
      output: '{"key": [ "c","a", "b"] }',
      options: [{ pathPattern: "^key$", order: ["c", "a", "b"] }],
      errors: [
        {
          message:
            "Expected array values to be in specified order. 'c' should be before 'b'.",
          line: 1,
          column: 20,
        },
      ],
    },
    {
      code: '{"key": ["a", "z", "b", "y", "c", "x"] }',
      output: '{"key": [ "c","a", "z", "b", "y", "x"] }',
      options: [{ pathPattern: "^key$", order: ["c", "a", "b"] }],
      errors: [
        {
          message:
            "Expected array values to be in specified order. 'c' should be before 'b'.",
          line: 1,
          column: 30,
        },
      ],
    },
    {
      code: '{"key": ["a", "z", "b", "y", "c", "x"] }',
      output: '{"key": [ "c","a", "z", "b", "y", "x"] }',
      options: [
        {
          pathPattern: "^key$",
          order: ["c", "a", "b", { order: { type: "asc" } }],
        },
      ],
      errors: [
        {
          message:
            "Expected array values to be in specified order. 'b' should be before 'z'.",
          line: 1,
          column: 20,
        },
        {
          message:
            "Expected array values to be in specified order. 'c' should be before 'y'.",
          line: 1,
          column: 30,
        },
      ],
    },
    {
      code: '{"key": [ "c","a", "z", "b", "y", "x"] }',
      output: '{"key": [ "c","a", "b", "z", "y", "x"] }',
      options: [
        {
          pathPattern: "^key$",
          order: ["c", "a", "b", { order: { type: "asc" } }],
        },
      ],
      errors: [
        "Expected array values to be in specified order. 'b' should be before 'z'.",
        "Expected array values to be in specified order. 'x' should be before 'y'.",
      ],
    },
    {
      code: '{"key": [ "c","a", "b", "z", "y", "x"] }',
      output: '{"key": [ "c","a", "b", "y", "z", "x"] }',
      options: [
        {
          pathPattern: "^key$",
          order: ["c", "a", "b", { order: { type: "asc" } }],
        },
      ],
      errors: [
        "Expected array values to be in specified order. 'y' should be before 'z'.",
        "Expected array values to be in specified order. 'x' should be before 'y'.",
      ],
    },
    {
      code: '{"key": [ "c","a", "b", "y", "z", "x"] }',
      output: '{"key": [ "c","a", "b", "x", "y", "z"] }',
      options: [
        {
          pathPattern: "^key$",
          order: ["c", "a", "b", { order: { type: "asc" } }],
        },
      ],
      errors: [
        "Expected array values to be in specified order. 'x' should be before 'z'.",
      ],
    },
    {
      code: '{"key": [,2,1] }',
      output: '{"key": [,1,2] }',
      options: [
        {
          pathPattern: "^key$",
          order: { type: "asc" },
        },
      ],
      errors: [
        {
          message:
            "Expected array values to be in ascending order. '1' should be before '2'.",
          line: 1,
          column: 13,
        },
      ],
    },
    {
      code: '{"key": ["b", "a", "c", 2, 1] }',
      output: '{"key": [ "a","b", "c", 1, 2] }',
      options: [
        {
          pathPattern: "^key$",
          order: { type: "asc" },
        },
      ],
      errors: [
        {
          message:
            "Expected array values to be in ascending order. 'a' should be before 'b'.",
          line: 1,
          column: 15,
        },
        {
          message:
            "Expected array values to be in ascending order. '1' should be before '2'.",
          line: 1,
          column: 28,
        },
      ],
    },
    {
      code: '{"key": ["b", "c", "a", 1, 2] }',
      output: '{"key": [ "c","b", "a", 2, 1] }',
      options: [
        {
          pathPattern: "^key$",
          order: { type: "desc" },
        },
      ],
      errors: [
        "Expected array values to be in descending order. 'c' should be before 'b'.",
        "Expected array values to be in descending order. '2' should be before '1'.",
      ],
    },
    {
      code: '{"key": ["A", "b", "a", "B"] }',
      output: '{"key": ["A", "a", "b", "B"] }',
      options: [
        {
          pathPattern: "^key$",
          order: { type: "asc", caseSensitive: false },
        },
      ],
      errors: [
        "Expected array values to be in insensitive ascending order. 'a' should be before 'b'.",
      ],
    },
    {
      code: '{"key": ["A", "a", "b", "B"] }',
      output: '{"key": ["A", "B", "a", "b"] }',
      options: [
        {
          pathPattern: "^key$",
          order: { type: "asc", caseSensitive: true },
        },
      ],
      errors: [
        "Expected array values to be in ascending order. 'B' should be before 'b'.",
      ],
    },
    {
      code: '{"key": ["A", "a", "b", "B"] }',
      output: '{"key": ["A", "B", "a", "b"] }',
      options: [
        {
          pathPattern: "^key$",
          order: { type: "asc" },
        },
      ],
      errors: [
        "Expected array values to be in ascending order. 'B' should be before 'b'.",
      ],
    },
    {
      code: '{"key": ["A", "a", "b", "B"] }',
      output: '{"key": ["A", "B", "a", "b"] }',
      options: [
        {
          pathPattern: "^key$",
          order: { type: "asc", natural: true },
        },
      ],
      errors: [
        "Expected array values to be in natural ascending order. 'B' should be before 'b'.",
      ],
    },
  ],
});
