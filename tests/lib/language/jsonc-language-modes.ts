import assert from "node:assert";
import { Linter } from "eslint";
import plugin from "../../../lib/index.ts";

type LanguageMode = "jsonc/json" | "jsonc/jsonc" | "jsonc/json5" | "jsonc/x";

/**
 * Create a Linter config for the specified language mode.
 * Intentionally do not pass languageOptions here — the test ensures mode
 * is selected solely via the `language` property.
 */
function createConfig(language: LanguageMode): Linter.Config[] {
  return [
    {
      files: ["**/*.json", "**/*.jsonc", "**/*.json5"],
      plugins: { jsonc: plugin },
      language,
    },
  ];
}

/**
 * Run `linter.verify()` and return fatal parse messages.
 */
function getFatalErrors(
  code: string,
  language: LanguageMode,
  filename = "test.json",
): Linter.LintMessage[] {
  const linter = new Linter();
  const messages = linter.verify(code, createConfig(language), filename);
  return messages.filter((m) => m.fatal);
}

// ─── JSON ────────────────────────────────────────────────────────────────────

describe("language: jsonc/json", () => {
  describe("accepts valid JSON", () => {
    it("string values", () => {
      const errors = getFatalErrors(`{"key": "value"}`, "jsonc/json");
      assert.strictEqual(errors.length, 0);
    });

    it("numbers, arrays, null, booleans", () => {
      const errors = getFatalErrors(
        `{"n": 42, "a": [1, 2], "b": true, "v": null}`,
        "jsonc/json",
      );
      assert.strictEqual(errors.length, 0);
    });
  });

  describe("rejects invalid JSON", () => {
    it("block comments are a parse error", () => {
      const errors = getFatalErrors(
        `/* comment */ {"key": "value"}`,
        "jsonc/json",
      );
      assert.ok(errors.length > 0, "block comments should be a parse error");
    });

    it("line comments are a parse error", () => {
      const errors = getFatalErrors(
        `// comment\n{"key": "value"}`,
        "jsonc/json",
      );
      assert.ok(errors.length > 0, "line comments should be a parse error");
    });

    it("trailing commas are a parse error", () => {
      const errors = getFatalErrors(`{"key": "value",}`, "jsonc/json");
      assert.ok(errors.length > 0, "trailing commas should be a parse error");
    });

    it("single-quoted strings are a parse error", () => {
      const errors = getFatalErrors(`{'key': 'value'}`, "jsonc/json");
      assert.ok(
        errors.length > 0,
        "single-quoted strings should be a parse error",
      );
    });

    it("unquoted property names are a parse error", () => {
      const errors = getFatalErrors(`{key: "value"}`, "jsonc/json");
      assert.ok(
        errors.length > 0,
        "unquoted property names should be a parse error",
      );
    });

    it("hex numeric literals are a parse error", () => {
      const errors = getFatalErrors(`{"n": 0xFF}`, "jsonc/json");
      assert.ok(
        errors.length > 0,
        "hex numeric literals should be a parse error",
      );
    });
  });
});

// ─── JSONC ───────────────────────────────────────────────────────────────────

describe("language: jsonc/jsonc", () => {
  describe("accepts JSON and JSONC syntax", () => {
    it("valid JSON", () => {
      const errors = getFatalErrors(
        `{"key": "value"}`,
        "jsonc/jsonc",
        "test.jsonc",
      );
      assert.strictEqual(errors.length, 0);
    });

    it("allows block comments", () => {
      const errors = getFatalErrors(
        `/* comment */ {"key": "value"}`,
        "jsonc/jsonc",
        "test.jsonc",
      );
      assert.strictEqual(errors.length, 0, "block comments should be allowed");
    });

    it("allows line comments", () => {
      const errors = getFatalErrors(
        `// comment\n{"key": "value"}`,
        "jsonc/jsonc",
        "test.jsonc",
      );
      assert.strictEqual(errors.length, 0, "line comments should be allowed");
    });

    it("allows trailing commas", () => {
      const errors = getFatalErrors(
        `{"key": "value",}`,
        "jsonc/jsonc",
        "test.jsonc",
      );
      assert.strictEqual(errors.length, 0, "trailing commas should be allowed");
    });

    it("allows trailing commas in arrays", () => {
      const errors = getFatalErrors(`[1, 2, 3,]`, "jsonc/jsonc", "test.jsonc");
      assert.strictEqual(
        errors.length,
        0,
        "array trailing commas should be allowed",
      );
    });
  });

  describe("rejects JSON5-only syntax", () => {
    it("single-quoted strings are a parse error", () => {
      const errors = getFatalErrors(
        `{'key': 'value'}`,
        "jsonc/jsonc",
        "test.jsonc",
      );
      assert.ok(
        errors.length > 0,
        "single-quoted strings should be a parse error",
      );
    });

    it("unquoted property names are a parse error", () => {
      const errors = getFatalErrors(
        `{key: "value"}`,
        "jsonc/jsonc",
        "test.jsonc",
      );
      assert.ok(
        errors.length > 0,
        "unquoted property names should be a parse error",
      );
    });

    it("hex numeric literals are a parse error", () => {
      const errors = getFatalErrors(`{"n": 0xFF}`, "jsonc/jsonc", "test.jsonc");
      assert.ok(
        errors.length > 0,
        "hex numeric literals should be a parse error",
      );
    });
  });
});

// ─── JSON5 ──────────────────────────────────────────────────────────────────

describe("language: jsonc/json5", () => {
  describe("accepts JSON5 syntax", () => {
    it("valid JSON", () => {
      const errors = getFatalErrors(
        `{"key": "value"}`,
        "jsonc/json5",
        "test.json5",
      );
      assert.strictEqual(errors.length, 0);
    });

    it("allows block comments", () => {
      const errors = getFatalErrors(
        `/* comment */ {"key": "value"}`,
        "jsonc/json5",
        "test.json5",
      );
      assert.strictEqual(errors.length, 0, "block comments should be allowed");
    });

    it("allows line comments", () => {
      const errors = getFatalErrors(
        `// comment\n{"key": "value"}`,
        "jsonc/json5",
        "test.json5",
      );
      assert.strictEqual(errors.length, 0, "line comments should be allowed");
    });

    it("allows trailing commas", () => {
      const errors = getFatalErrors(
        `{"key": "value",}`,
        "jsonc/json5",
        "test.json5",
      );
      assert.strictEqual(errors.length, 0, "trailing commas should be allowed");
    });

    it("allows single-quoted strings", () => {
      const errors = getFatalErrors(
        `{'key': 'value'}`,
        "jsonc/json5",
        "test.json5",
      );
      assert.strictEqual(
        errors.length,
        0,
        "single-quoted strings should be allowed",
      );
    });

    it("allows unquoted property names", () => {
      const errors = getFatalErrors(
        `{key: "value"}`,
        "jsonc/json5",
        "test.json5",
      );
      assert.strictEqual(
        errors.length,
        0,
        "unquoted property names should be allowed",
      );
    });

    it("allows hex numeric literals", () => {
      const errors = getFatalErrors(`{"n": 0xFF}`, "jsonc/json5", "test.json5");
      assert.strictEqual(
        errors.length,
        0,
        "hex numeric literals should be allowed",
      );
    });

    it("allows positive signed numbers", () => {
      const errors = getFatalErrors(`{"n": +42}`, "jsonc/json5", "test.json5");
      assert.strictEqual(
        errors.length,
        0,
        "positive signed numbers should be allowed",
      );
    });

    it("allows Infinity", () => {
      const errors = getFatalErrors(
        `{"n": Infinity}`,
        "jsonc/json5",
        "test.json5",
      );
      assert.strictEqual(errors.length, 0, "Infinity should be allowed");
    });

    it("allows NaN", () => {
      const errors = getFatalErrors(`{"n": NaN}`, "jsonc/json5", "test.json5");
      assert.strictEqual(errors.length, 0, "NaN should be allowed");
    });
  });
});

// ─── x (EXTENDED) ────────────────────────────────────────────────────────────

describe("language: jsonc/x", () => {
  describe("accepts extended syntax", () => {
    it("valid JSON", () => {
      const errors = getFatalErrors(`{"key": "value"}`, "jsonc/x");
      assert.strictEqual(errors.length, 0);
    });

    it("allows block comments", () => {
      const errors = getFatalErrors(
        `/* comment */ {"key": "value"}`,
        "jsonc/x",
      );
      assert.strictEqual(errors.length, 0);
    });

    it("allows line comments", () => {
      const errors = getFatalErrors(`// comment\n{"key": "value"}`, "jsonc/x");
      assert.strictEqual(errors.length, 0);
    });

    it("allows trailing commas", () => {
      const errors = getFatalErrors(`{"key": "value",}`, "jsonc/x");
      assert.strictEqual(errors.length, 0);
    });

    it("allows single-quoted strings", () => {
      const errors = getFatalErrors(`{'key': 'value'}`, "jsonc/x");
      assert.strictEqual(errors.length, 0);
    });

    it("allows unquoted property names", () => {
      const errors = getFatalErrors(`{key: "value"}`, "jsonc/x");
      assert.strictEqual(errors.length, 0);
    });

    it("allows hex numeric literals", () => {
      const errors = getFatalErrors(`{"n": 0xFF}`, "jsonc/x");
      assert.strictEqual(errors.length, 0);
    });

    it("allows Infinity", () => {
      const errors = getFatalErrors(`{"n": Infinity}`, "jsonc/x");
      assert.strictEqual(errors.length, 0);
    });

    it("allows NaN", () => {
      const errors = getFatalErrors(`{"n": NaN}`, "jsonc/x");
      assert.strictEqual(errors.length, 0);
    });
  });
});

// ─── Cross-mode behavior comparison ──────────────────────────────────────────

describe("language mode feature matrix", () => {
  const comment = `/* comment */ {"key": "value"}`;
  const trailingComma = `{"key": "value",}`;
  const singleQuote = `{'key': 'value'}`;
  const unquotedKey = `{key: "value"}`;
  const hexNumber = `{"n": 0xFF}`;

  it("comments: json=NG / jsonc=OK / json5=OK / x=OK", () => {
    assert.ok(
      getFatalErrors(comment, "jsonc/json").length > 0,
      "json should not allow comments",
    );
    assert.strictEqual(
      getFatalErrors(comment, "jsonc/jsonc", "test.jsonc").length,
      0,
      "jsonc should allow comments",
    );
    assert.strictEqual(
      getFatalErrors(comment, "jsonc/json5", "test.json5").length,
      0,
      "json5 should allow comments",
    );
    assert.strictEqual(
      getFatalErrors(comment, "jsonc/x").length,
      0,
      "x should allow comments",
    );
  });

  it("trailing commas: json=NG / jsonc=OK / json5=OK / x=OK", () => {
    assert.ok(
      getFatalErrors(trailingComma, "jsonc/json").length > 0,
      "json should not allow trailing commas",
    );
    assert.strictEqual(
      getFatalErrors(trailingComma, "jsonc/jsonc", "test.jsonc").length,
      0,
      "jsonc should allow trailing commas",
    );
    assert.strictEqual(
      getFatalErrors(trailingComma, "jsonc/json5", "test.json5").length,
      0,
      "json5 should allow trailing commas",
    );
    assert.strictEqual(
      getFatalErrors(trailingComma, "jsonc/x").length,
      0,
      "x should allow trailing commas",
    );
  });

  it("single-quote: json=NG / jsonc=NG / json5=OK / x=OK", () => {
    assert.ok(
      getFatalErrors(singleQuote, "jsonc/json").length > 0,
      "json should not allow single quotes",
    );
    assert.ok(
      getFatalErrors(singleQuote, "jsonc/jsonc", "test.jsonc").length > 0,
      "jsonc should not allow single quotes",
    );
    assert.strictEqual(
      getFatalErrors(singleQuote, "jsonc/json5", "test.json5").length,
      0,
      "json5 should allow single quotes",
    );
    assert.strictEqual(
      getFatalErrors(singleQuote, "jsonc/x").length,
      0,
      "x should allow single quotes",
    );
  });

  it("unquoted keys: json=NG / jsonc=NG / json5=OK / x=OK", () => {
    assert.ok(
      getFatalErrors(unquotedKey, "jsonc/json").length > 0,
      "json should not allow unquoted keys",
    );
    assert.ok(
      getFatalErrors(unquotedKey, "jsonc/jsonc", "test.jsonc").length > 0,
      "jsonc should not allow unquoted keys",
    );
    assert.strictEqual(
      getFatalErrors(unquotedKey, "jsonc/json5", "test.json5").length,
      0,
      "json5 should allow unquoted keys",
    );
    assert.strictEqual(
      getFatalErrors(unquotedKey, "jsonc/x").length,
      0,
      "x should allow unquoted keys",
    );
  });

  it("hex literals: json=NG / jsonc=NG / json5=OK / x=OK", () => {
    assert.ok(
      getFatalErrors(hexNumber, "jsonc/json").length > 0,
      "json should not allow hex literals",
    );
    assert.ok(
      getFatalErrors(hexNumber, "jsonc/jsonc", "test.jsonc").length > 0,
      "jsonc should not allow hex literals",
    );
    assert.strictEqual(
      getFatalErrors(hexNumber, "jsonc/json5", "test.json5").length,
      0,
      "json5 should allow hex literals",
    );
    assert.strictEqual(
      getFatalErrors(hexNumber, "jsonc/x").length,
      0,
      "x should allow hex literals",
    );
  });
});
