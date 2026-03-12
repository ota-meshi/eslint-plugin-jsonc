import assert from "node:assert";
import { Linter } from "eslint";
import plugin from "../../../lib/index.ts";
import semver from "semver";

/**
 * Creates a config array for testing with the specified jsonSyntax and rules.
 */
function createConfig(
  jsonSyntax: "JSON" | "JSONC" | "JSON5" | null | undefined,
  rules: Linter.RulesRecord = {},
): Linter.Config[] {
  return [
    {
      files: ["**/*.json", "**/*.jsonc", "**/*.json5"],
      plugins: { jsonc: plugin },
      language: "jsonc/x",
      languageOptions:
        jsonSyntax != null ? { parserOptions: { jsonSyntax } } : {},
      rules,
    },
  ];
}

describe("JSONC Language", () => {
  let linter: Linter;

  beforeEach(() => {
    linter = new Linter();
  });

  describe("Normal", () => {
    it("should not have parse errors for valid JSON", () => {
      const code = `{"key": "value"}`;
      const messages = linter.verify(code, createConfig("JSON"), "test.json");

      assert.deepStrictEqual(messages, []);
    });
  });

  describe("Errors", () => {
    it("should have parse errors for invalid JSON", () => {
      const code = `{"key": "value",}`;
      const messages = linter.verify(code, createConfig("JSON"), "test.json");

      assert.deepStrictEqual(messages, [
        {
          fatal: true,
          message: "Parsing error: Unexpected token ','.",
          line: 1,
          column: 16,
          ruleId: null,
          severity: 2,
          ...(semver.lt(Linter.version, "10.0.0") ? { nodeType: null } : {}),
        },
      ]);
    });
  });
});
