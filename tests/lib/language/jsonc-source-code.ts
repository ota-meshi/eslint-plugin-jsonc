import assert from "node:assert";
import { parseForESLint } from "jsonc-eslint-parser";
import { JSONCSourceCode } from "../../../lib/language/jsonc-source-code.ts";

function createSourceCode(code: string): JSONCSourceCode {
  const result = parseForESLint(code);
  return new JSONCSourceCode({
    text: code,
    ast: result.ast,
    hasBOM: false,
    parserServices: { isJSON: true },
    visitorKeys: result.visitorKeys,
  });
}

describe("JSONCSourceCode", () => {
  describe("getNodeByRangeIndex", () => {
    it("should return the deepest node containing the index", () => {
      const code = `{"key": "value"}`;
      const sourceCode = createSourceCode(code);

      // Index 0 is at '{', inside the JSONObjectExpression
      const node = sourceCode.getNodeByRangeIndex(0);

      assert.ok(node);
      assert.strictEqual(node.type, "JSONObjectExpression");
    });

    it("should return JSONLiteral when index is inside a key", () => {
      const code = `{"key": "value"}`;
      const sourceCode = createSourceCode(code);

      // Index 2 is inside "key"
      const node = sourceCode.getNodeByRangeIndex(2);

      assert.ok(node);
      assert.strictEqual(node.type, "JSONLiteral");
    });

    it("should return JSONLiteral when index is inside a value", () => {
      const code = `{"key": "value"}`;
      const sourceCode = createSourceCode(code);

      // Index 10 is inside "value"
      const node = sourceCode.getNodeByRangeIndex(10);

      assert.ok(node);
      assert.strictEqual(node.type, "JSONLiteral");
    });

    it("should return null when index is out of range", () => {
      const code = `{"key": "value"}`;
      const sourceCode = createSourceCode(code);

      const node = sourceCode.getNodeByRangeIndex(1000);

      assert.strictEqual(node, null);
    });

    it("should return the correct node in nested structures", () => {
      const code = `{"outer": {"inner": 42}}`;
      const sourceCode = createSourceCode(code);

      // Index 10 is inside the inner object
      const innerObjNode = sourceCode.getNodeByRangeIndex(10);

      assert.ok(innerObjNode);
      assert.strictEqual(innerObjNode.type, "JSONObjectExpression");
    });

    it("should work with arrays", () => {
      const code = `[1, 2, 3]`;
      const sourceCode = createSourceCode(code);

      // Index 1 is at '1'
      const node = sourceCode.getNodeByRangeIndex(1);

      assert.ok(node);
      assert.strictEqual(node.type, "JSONLiteral");
    });
  });

  describe("isSpaceBetween", () => {
    it("should return true when there is space between two tokens", () => {
      const code = `{"key": "value"}`;
      const sourceCode = createSourceCode(code);

      // tokensAndComments are sorted by position
      const colonToken = sourceCode.tokensAndComments.find(
        (t) => t.type === "Punctuator" && t.value === ":",
      )!;
      const valueToken = sourceCode.tokensAndComments.find(
        (t) => t.type === "String" && t.value === '"value"',
      )!;

      const result = sourceCode.isSpaceBetween(colonToken, valueToken);

      assert.strictEqual(result, true);
    });

    it("should return false when there is no space between two tokens", () => {
      const code = `{"key":"value"}`;
      const sourceCode = createSourceCode(code);

      const colonToken = sourceCode.tokensAndComments.find(
        (t) => t.type === "Punctuator" && t.value === ":",
      )!;
      const valueToken = sourceCode.tokensAndComments.find(
        (t) => t.type === "String" && t.value === '"value"',
      )!;

      const result = sourceCode.isSpaceBetween(colonToken, valueToken);

      assert.strictEqual(result, false);
    });

    it("should work regardless of token order (reversed)", () => {
      const code = `{"key": "value"}`;
      const sourceCode = createSourceCode(code);

      const colonToken = sourceCode.tokensAndComments.find(
        (t) => t.type === "Punctuator" && t.value === ":",
      )!;
      const valueToken = sourceCode.tokensAndComments.find(
        (t) => t.type === "String" && t.value === '"value"',
      )!;

      // Reversed order should produce the same result
      const result = sourceCode.isSpaceBetween(valueToken, colonToken);

      assert.strictEqual(result, true);
    });

    it("should return false for adjacent tokens without space", () => {
      const code = `[1,2,3]`;
      const sourceCode = createSourceCode(code);

      const commaToken = sourceCode.tokensAndComments.find(
        (t) => t.type === "Punctuator" && t.value === ",",
      )!;
      const twoToken = sourceCode.tokensAndComments.find(
        (t) => t.type === "Numeric" && t.value === "2",
      )!;

      const result = sourceCode.isSpaceBetween(commaToken, twoToken);

      assert.strictEqual(result, false);
    });

    it("should return true for tokens with space in arrays", () => {
      const code = `[1, 2, 3]`;
      const sourceCode = createSourceCode(code);

      const commaToken = sourceCode.tokensAndComments.find(
        (t) => t.type === "Punctuator" && t.value === ",",
      )!;
      const twoToken = sourceCode.tokensAndComments.find(
        (t) => t.type === "Numeric" && t.value === "2",
      )!;

      const result = sourceCode.isSpaceBetween(commaToken, twoToken);

      assert.strictEqual(result, true);
    });
  });

  describe("isSpaceBetweenTokens (deprecated alias)", () => {
    it("should behave the same as isSpaceBetween", () => {
      const code = `{"key": "value"}`;
      const sourceCode = createSourceCode(code);

      const colonToken = sourceCode.tokensAndComments.find(
        (t) => t.type === "Punctuator" && t.value === ":",
      )!;
      const valueToken = sourceCode.tokensAndComments.find(
        (t) => t.type === "String" && t.value === '"value"',
      )!;

      const result1 = sourceCode.isSpaceBetween(colonToken, valueToken);
      const result2 = sourceCode.isSpaceBetweenTokens(colonToken, valueToken);

      assert.strictEqual(result1, result2);
    });
  });

  describe("getText", () => {
    it("should return the full source text when no node is given", () => {
      const code = `{"key": "value"}`;
      const sourceCode = createSourceCode(code);

      assert.strictEqual(sourceCode.getText(), code);
    });

    it("should return text for a specific node", () => {
      const code = `{"key": "value"}`;
      const sourceCode = createSourceCode(code);

      const expr = sourceCode.ast.body[0].expression;
      if (expr.type !== "JSONObjectExpression")
        throw new Error("Expected object");
      const prop = expr.properties[0];
      const text = sourceCode.getText(prop.key as never);

      assert.strictEqual(text, '"key"');
    });
  });

  describe("getTokens", () => {
    it("should return all tokens in a node", () => {
      const code = `{"key": "value"}`;
      const sourceCode = createSourceCode(code);

      const objNode = sourceCode.ast.body[0].expression;
      const tokens = sourceCode.getTokens(objNode as never);

      assert.ok(tokens.length > 0);
      const values = tokens.map((t) => t.value);
      assert.ok(values.includes("{"));
      assert.ok(values.includes("}"));
    });
  });

  describe("getCommentsBefore / getCommentsAfter", () => {
    it("should return comments before a node", () => {
      const code = `/* comment before */\n{"key": "value"}`;
      const sourceCode = createSourceCode(code);

      const stmt = sourceCode.ast.body[0];
      const comments = sourceCode.getCommentsBefore(stmt as never);

      assert.strictEqual(comments.length, 1);
      assert.strictEqual(comments[0].value, " comment before ");
    });

    it("should return comments after a node", () => {
      const code = `{"key": "value"} /* comment after */`;
      const sourceCode = createSourceCode(code);

      const stmt = sourceCode.ast.body[0];
      const comments = sourceCode.getCommentsAfter(stmt as never);

      assert.strictEqual(comments.length, 1);
      assert.strictEqual(comments[0].value, " comment after ");
    });

    it("should return empty array when no comments around a node", () => {
      const code = `{"key": "value"}`;
      const sourceCode = createSourceCode(code);

      const stmt = sourceCode.ast.body[0];

      assert.strictEqual(sourceCode.getCommentsBefore(stmt as never).length, 0);
      assert.strictEqual(sourceCode.getCommentsAfter(stmt as never).length, 0);
    });
  });

  describe("getAllComments", () => {
    it("should return all comments in the source", () => {
      const code = `/* first */ {"key": "value"} /* second */`;
      const sourceCode = createSourceCode(code);

      const comments = sourceCode.getAllComments();

      assert.strictEqual(comments.length, 2);
    });

    it("should return empty array when no comments", () => {
      const code = `{"key": "value"}`;
      const sourceCode = createSourceCode(code);

      const comments = sourceCode.getAllComments();

      assert.strictEqual(comments.length, 0);
    });
  });

  describe("tokensAndComments", () => {
    it("should include both tokens and comments sorted by position", () => {
      const code = `/* a */ [1, 2] // b`;
      const sourceCode = createSourceCode(code);

      const all = sourceCode.tokensAndComments;

      // Should be sorted by start position
      for (let i = 1; i < all.length; i++) {
        assert.ok(
          all[i].range[0] >= all[i - 1].range[1],
          `Token at index ${i} should come after token at ${i - 1}`,
        );
      }

      const types = all.map((t) => t.type);
      assert.ok(types.includes("Block")); // /* a */
      assert.ok(types.includes("Line")); // // b
      assert.ok(types.includes("Punctuator")); // [ and ]
      assert.ok(types.includes("Numeric")); // 1, 2
    });
  });

  describe("lines", () => {
    it("should split source text into lines", () => {
      const code = `{\n  "key": "value"\n}`;
      const sourceCode = createSourceCode(code);

      assert.strictEqual(sourceCode.lines.length, 3);
      assert.strictEqual(sourceCode.lines[0], "{");
      assert.strictEqual(sourceCode.lines[1], '  "key": "value"');
      assert.strictEqual(sourceCode.lines[2], "}");
    });
  });

  describe("parserServices", () => {
    it("should expose isJSON: true", () => {
      const code = `{"key": "value"}`;
      const sourceCode = createSourceCode(code);

      assert.strictEqual(sourceCode.parserServices.isJSON, true);
    });
  });
});
