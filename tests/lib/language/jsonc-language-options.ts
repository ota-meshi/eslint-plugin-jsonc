import assert from "node:assert";
import { Linter, ESLint } from "eslint";
import plugin from "../../../lib/index.ts";

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

describe("JSONC Language Options", () => {
  let linter: Linter;

  beforeEach(() => {
    linter = new Linter();
  });

  describe("jsonSyntax option", () => {
    describe("JSON mode", () => {
      it("should reject block comments when jsonSyntax is 'JSON'", () => {
        const code = `/* comment */ {"key": "value"}`;
        const messages = linter.verify(code, createConfig("JSON"), "test.json");
        const fatalErrors = messages.filter((m) => m.fatal);

        assert.ok(fatalErrors.length > 0, "Should have a parse error");
        assert.ok(
          fatalErrors[0].message.includes("comment"),
          "Error should mention comment",
        );
      });

      it("should reject trailing commas when jsonSyntax is 'JSON'", () => {
        const code = `{"key": "value",}`;
        const messages = linter.verify(code, createConfig("JSON"), "test.json");
        const fatalErrors = messages.filter((m) => m.fatal);

        assert.ok(fatalErrors.length > 0, "Should have a parse error");
      });

      it("should accept valid JSON when jsonSyntax is 'JSON'", () => {
        const code = `{"key": "value", "num": 42}`;
        const messages = linter.verify(code, createConfig("JSON"), "test.json");
        const fatalErrors = messages.filter((m) => m.fatal);

        assert.strictEqual(
          fatalErrors.length,
          0,
          "Should not have parse errors",
        );
      });
    });

    describe("JSONC mode", () => {
      it("should allow block comments when jsonSyntax is 'JSONC'", () => {
        const code = `/* comment */ {"key": "value"}`;
        const messages = linter.verify(
          code,
          createConfig("JSONC"),
          "test.jsonc",
        );
        const fatalErrors = messages.filter((m) => m.fatal);

        assert.strictEqual(
          fatalErrors.length,
          0,
          "Should not have parse errors",
        );
      });

      it("should allow line comments when jsonSyntax is 'JSONC'", () => {
        const code = `// comment\n{"key": "value"}`;
        const messages = linter.verify(
          code,
          createConfig("JSONC"),
          "test.jsonc",
        );
        const fatalErrors = messages.filter((m) => m.fatal);

        assert.strictEqual(
          fatalErrors.length,
          0,
          "Should not have parse errors",
        );
      });

      it("should reject single-quoted strings when jsonSyntax is 'JSONC'", () => {
        const code = `{'key': 'value'}`;
        const messages = linter.verify(
          code,
          createConfig("JSONC"),
          "test.jsonc",
        );
        const fatalErrors = messages.filter((m) => m.fatal);

        assert.ok(fatalErrors.length > 0, "Should have a parse error");
      });
    });

    describe("JSON5 mode", () => {
      it("should allow trailing commas when jsonSyntax is 'JSON5'", () => {
        const code = `{"key": "value",}`;
        const messages = linter.verify(
          code,
          createConfig("JSON5"),
          "test.json5",
        );
        const fatalErrors = messages.filter((m) => m.fatal);

        assert.strictEqual(
          fatalErrors.length,
          0,
          "Should not have parse errors",
        );
      });

      it("should allow block comments when jsonSyntax is 'JSON5'", () => {
        const code = `/* comment */ {"key": "value"}`;
        const messages = linter.verify(
          code,
          createConfig("JSON5"),
          "test.json5",
        );
        const fatalErrors = messages.filter((m) => m.fatal);

        assert.strictEqual(
          fatalErrors.length,
          0,
          "Should not have parse errors",
        );
      });

      it("should allow single-quoted strings when jsonSyntax is 'JSON5'", () => {
        const code = `{'key': 'value'}`;
        const messages = linter.verify(
          code,
          createConfig("JSON5"),
          "test.json5",
        );
        const fatalErrors = messages.filter((m) => m.fatal);

        assert.strictEqual(
          fatalErrors.length,
          0,
          "Should not have parse errors",
        );
      });
    });

    describe("default mode (no jsonSyntax)", () => {
      it("should allow block comments by default", () => {
        const code = `/* comment */ {"key": "value"}`;
        const messages = linter.verify(
          code,
          createConfig(undefined),
          "test.json",
        );
        const fatalErrors = messages.filter((m) => m.fatal);

        assert.strictEqual(
          fatalErrors.length,
          0,
          "Should not have parse errors in default mode",
        );
      });

      it("should allow line comments by default", () => {
        const code = `// comment\n{"key": "value"}`;
        const messages = linter.verify(
          code,
          createConfig(undefined),
          "test.json",
        );
        const fatalErrors = messages.filter((m) => m.fatal);

        assert.strictEqual(
          fatalErrors.length,
          0,
          "Should not have parse errors in default mode",
        );
      });
    });
  });

  describe("language plugin integration", () => {
    it("should expose languages.jsonc", () => {
      assert.ok(plugin.languages?.jsonc, "Plugin should have a jsonc language");
    });

    it("should produce correct parse results via ESLint", async () => {
      const eslint = new ESLint({
        overrideConfigFile: true,
        overrideConfig: [
          {
            plugins: { jsonc: plugin },
            files: ["**/*.json"],
            language: "jsonc/x",
            rules: { "jsonc/no-dupe-keys": "error" },
          },
        ],
      });

      const results = await eslint.lintText('{"key": "value"}', {
        filePath: "test.json",
      });

      assert.ok(Array.isArray(results));
      assert.strictEqual(results.length, 1);
      assert.deepStrictEqual(results[0].messages, []);
    });

    it("should report errors for invalid JSON", async () => {
      const eslint = new ESLint({
        overrideConfigFile: true,
        overrideConfig: [
          {
            plugins: { jsonc: plugin },
            files: ["**/*.json"],
            language: "jsonc/x",
            languageOptions: { parserOptions: { jsonSyntax: "JSON" } },
            rules: {},
          },
        ],
      });

      const results = await eslint.lintText("/* comment */ {}", {
        filePath: "test.json",
      });

      assert.ok(Array.isArray(results));
      assert.strictEqual(results.length, 1);
      assert.ok(results[0].messages.length > 0, "Should have parse error");
      assert.ok(results[0].messages[0].fatal, "Error should be fatal");
    });

    it("should work with recommended-with-json config", async () => {
      const eslint = new ESLint({
        overrideConfigFile: true,
        overrideConfig: plugin.configs["recommended-with-json"],
      });

      const results = await eslint.lintText('{"key": "value"}', {
        filePath: "test.json",
      });

      assert.ok(Array.isArray(results));
      assert.strictEqual(results.length, 1);
    });

    it("should work with recommended-with-jsonc config", async () => {
      const eslint = new ESLint({
        overrideConfigFile: true,
        overrideConfig: plugin.configs["recommended-with-jsonc"],
      });

      const results = await eslint.lintText('/* comment */ {"key": "value"}', {
        filePath: "test.jsonc",
      });

      assert.ok(Array.isArray(results));
      assert.strictEqual(results.length, 1);
    });
  });
});
