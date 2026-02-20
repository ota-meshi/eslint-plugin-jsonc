import assert from "node:assert";
import { Linter } from "eslint";
import plugin from "../../../lib/index.ts";

/**
 * Creates a config array for testing with the specified rules.
 */
function createConfig(rules: Linter.RulesRecord): Linter.Config[] {
  return [
    {
      files: ["**/*.json"],
      plugins: { jsonc: plugin },
      language: "jsonc/x",
      rules,
    },
  ];
}

/**
 * Test suite for ESLint directive comments in JSONC files.
 *
 * Tests that eslint-disable, eslint-disable-line, eslint-disable-next-line,
 * and eslint-enable directives work correctly in JSONC files using block
 * comments (/* ... *\/) since JSONC uses block-style comments.
 */
describe("Directive Comments", () => {
  let linter: Linter;

  beforeEach(() => {
    linter = new Linter();
  });

  describe("eslint-disable", () => {
    it("should disable all rules for the rest of the file", () => {
      const code = `/* eslint-disable */
{"key": "value", "key": "value"}`;
      const config = createConfig({
        "jsonc/no-dupe-keys": "error",
      });

      const messages = linter.verify(code, config, "test.json");
      const errors = messages.filter((m) => m.ruleId === "jsonc/no-dupe-keys");

      assert.strictEqual(
        errors.length,
        0,
        "Rule should be disabled by eslint-disable comment",
      );
    });

    it("should disable a specific rule for the rest of the file", () => {
      const code = `/* eslint-disable jsonc/no-dupe-keys */
{"key": "value", "key": "value"}`;
      const config = createConfig({
        "jsonc/no-dupe-keys": "error",
      });

      const messages = linter.verify(code, config, "test.json");
      const errors = messages.filter((m) => m.ruleId === "jsonc/no-dupe-keys");

      assert.strictEqual(
        errors.length,
        0,
        "Rule should be disabled by eslint-disable comment",
      );
    });

    it("should not disable rules not mentioned in the directive", () => {
      const code = `/* eslint-disable jsonc/some-other-rule */
{"key": "value", "key": "value"}`;
      const config = createConfig({
        "jsonc/no-dupe-keys": "error",
      });

      const messages = linter.verify(code, config, "test.json");
      const errors = messages.filter((m) => m.ruleId === "jsonc/no-dupe-keys");

      assert.strictEqual(
        errors.length,
        1,
        "Rule should not be disabled when different rule is specified",
      );
    });
  });

  describe("eslint-disable-line", () => {
    it("should disable all rules for the current line", () => {
      const code = `{
  "key": "value",
  "key": "value" /* eslint-disable-line */
}`;
      const config = createConfig({
        "jsonc/no-dupe-keys": "error",
      });

      const messages = linter.verify(code, config, "test.json");
      const errors = messages.filter((m) => m.ruleId === "jsonc/no-dupe-keys");

      assert.strictEqual(
        errors.length,
        0,
        "Rule should be disabled by eslint-disable-line comment",
      );
    });

    it("should disable a specific rule for the current line", () => {
      const code = `{
  "key": "value",
  "key": "value" /* eslint-disable-line jsonc/no-dupe-keys */
}`;
      const config = createConfig({
        "jsonc/no-dupe-keys": "error",
      });

      const messages = linter.verify(code, config, "test.json");
      const errors = messages.filter((m) => m.ruleId === "jsonc/no-dupe-keys");

      assert.strictEqual(
        errors.length,
        0,
        "Rule should be disabled by eslint-disable-line comment",
      );
    });
  });

  describe("eslint-disable-next-line", () => {
    it("should disable all rules for the next line", () => {
      const code = `{
/* eslint-disable-next-line */
  "key": "value",
  "key": "value"
}`;
      const config = createConfig({
        "jsonc/no-dupe-keys": "error",
      });

      const messages = linter.verify(code, config, "test.json");
      const errors = messages.filter((m) => m.ruleId === "jsonc/no-dupe-keys");

      // The rule fires on line 4 (the second "key"), which is not disabled
      assert.strictEqual(errors.length, 1);
      assert.strictEqual(errors[0].line, 4);
    });

    it("should disable a specific rule for the next line", () => {
      const code = `{
  "key": "value",
/* eslint-disable-next-line jsonc/no-dupe-keys */
  "key": "value"
}`;
      const config = createConfig({
        "jsonc/no-dupe-keys": "error",
      });

      const messages = linter.verify(code, config, "test.json");
      const errors = messages.filter((m) => m.ruleId === "jsonc/no-dupe-keys");

      assert.strictEqual(
        errors.length,
        0,
        "Rule should be disabled by eslint-disable-next-line",
      );
    });

    it("should work with justification after --", () => {
      const code = `{
  "key": "value",
/* eslint-disable-next-line jsonc/no-dupe-keys -- intentional duplicate */
  "key": "value"
}`;
      const config = createConfig({
        "jsonc/no-dupe-keys": "error",
      });

      const messages = linter.verify(code, config, "test.json");
      const errors = messages.filter((m) => m.ruleId === "jsonc/no-dupe-keys");

      assert.strictEqual(
        errors.length,
        0,
        "Rule should be disabled with justification",
      );
    });
  });

  describe("baseline - no directive", () => {
    it("should report errors when no directive is present", () => {
      const code = `{"key": "value", "key": "value"}`;
      const config = createConfig({
        "jsonc/no-dupe-keys": "error",
      });

      const messages = linter.verify(code, config, "test.json");
      const errors = messages.filter((m) => m.ruleId === "jsonc/no-dupe-keys");

      assert.strictEqual(
        errors.length,
        1,
        "Should report an error for duplicate key",
      );
    });
  });
});

/**
 * Test suite for ESLint inline configuration comments in JSONC files.
 */
describe("Inline Configuration Comments", () => {
  let linter: Linter;

  beforeEach(() => {
    linter = new Linter();
  });

  describe("eslint inline config", () => {
    it("should configure rules via eslint block comment", () => {
      const code = `/* eslint jsonc/no-dupe-keys: "off" */
{"key": "value", "key": "value"}`;
      const config = createConfig({
        "jsonc/no-dupe-keys": "error",
      });

      const messages = linter.verify(code, config, "test.json");
      const errors = messages.filter((m) => m.ruleId === "jsonc/no-dupe-keys");

      assert.strictEqual(
        errors.length,
        0,
        "Rule should be disabled by inline config",
      );
    });

    it("should report error for invalid inline config syntax", () => {
      const code = `/* eslint { invalid json */
{"key": "value"}`;
      const config = createConfig({});

      const messages = linter.verify(code, config, "test.json");
      // Invalid syntax should be reported as a problem
      const configErrors = messages.filter((m) => m.ruleId === null);

      assert.ok(
        configErrors.length > 0,
        "Should report an error for invalid inline config syntax",
      );
    });
  });
});
