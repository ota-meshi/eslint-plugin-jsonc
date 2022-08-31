import { RuleTester } from "eslint";
import rule from "../../../lib/rules/key-name-casing";

const tester = new RuleTester({
  parser: require.resolve("jsonc-eslint-parser"),
  parserOptions: {
    ecmaVersion: 2020,
  },
});

tester.run("key-name-casing", rule as any, {
  valid: [
    '{"key": "value"}',
    '{"camelCase": "value"}',
    '"PascalCase"',
    '"string"',
    '["element"]',
    {
      code: `
            {
                "foo.bar": "value",
            }`,
      options: [{ ignores: ["^[a-z\\.]+$"] }],
    },
  ],
  invalid: [
    {
      code: `
            {
                "camelCase": "camelCaseValue", 
                "PascalCase": "PascalCaseValue",
                "SCREAMING_SNAKE_CASE": "SCREAMING_SNAKE_CASE_VALUE",
                "kebab-case": "kebab-case-value",
                "snake_case": "snake_case_value",
                "Mixed-Case": "Mixed-Case-Value",
                "foo.bar": "value",
            }`,
      errors: [
        "Property name `PascalCase` must match one of the following formats: camelCase",
        "Property name `SCREAMING_SNAKE_CASE` must match one of the following formats: camelCase",
        "Property name `kebab-case` must match one of the following formats: camelCase",
        "Property name `snake_case` must match one of the following formats: camelCase",
        "Property name `Mixed-Case` must match one of the following formats: camelCase",
        "Property name `foo.bar` must match one of the following formats: camelCase",
      ],
    },
    {
      code: `
            {
                camelCase: "camelCaseValue", 
                PascalCase: "PascalCaseValue",
                SCREAMING_SNAKE_CASE: "SCREAMING_SNAKE_CASE_VALUE",
                snake_case: "snake_case_value",
            }`,
      errors: [
        "Property name `PascalCase` must match one of the following formats: camelCase",
        "Property name `SCREAMING_SNAKE_CASE` must match one of the following formats: camelCase",
        "Property name `snake_case` must match one of the following formats: camelCase",
      ],
    },
    {
      code: `
            {
                "camelCase": "camelCaseValue", 
                "PascalCase": "PascalCaseValue",
                "SCREAMING_SNAKE_CASE": "SCREAMING_SNAKE_CASE_VALUE",
                "kebab-case": "kebab-case-value",
                "snake_case": "snake_case_value",
                "Mixed-Case": "Mixed-Case-Value",
            }`,
      options: [
        {
          camelCase: true,
          "kebab-case": true,
          PascalCase: true,
          snake_case: true,
          SCREAMING_SNAKE_CASE: true,
        },
      ],
      errors: [
        "Property name `Mixed-Case` must match one of the following formats: camelCase, kebab-case, PascalCase, snake_case, SCREAMING_SNAKE_CASE",
      ],
    },
  ],
});
