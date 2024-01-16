// Most source code was copied from ESLint v8.
// MIT License. Copyright OpenJS Foundation and other contributors, <www.openjsf.org>
import type { AST, RuleListener } from "jsonc-eslint-parser";
import { createRule } from "../utils";
import { getSourceCode } from "eslint-compat-utils";
import type { JSONSchema4 } from "json-schema";
import type { Comment, Token } from "../types";
import type { SourceCode } from "eslint";
import {
  createGlobalLinebreakMatcher,
  isTokenOnSameLine,
} from "../utils/eslint-ast-utils";
import {
  isClosingBraceToken,
  isClosingBracketToken,
  isClosingParenToken,
  isColonToken,
  isCommentToken,
  isOpeningParenToken,
  isSemicolonToken,
} from "@eslint-community/eslint-utils";

const KNOWN_NODES: Set<AST.JSONNode["type"]> = new Set([
  "JSONArrayExpression",
  "JSONBinaryExpression",
  "JSONExpressionStatement",
  "JSONIdentifier",
  "JSONLiteral",
  "JSONObjectExpression",
  "Program",
  "JSONProperty",
  "JSONTemplateElement",
  "JSONTemplateLiteral",
  "JSONUnaryExpression",
] satisfies AST.JSONNode["type"][]);

type Offset = "first" | "off" | number;

// General rule strategy:
// 1. An OffsetStorage instance stores a map of desired offsets, where each token has a specified offset from another
//    specified token or to the first column.
// 2. As the AST is traversed, modify the desired offsets of tokens accordingly. For example, when entering a
//    BlockStatement, offset all of the tokens in the BlockStatement by 1 indent level from the opening curly
//    brace of the BlockStatement.
// 3. After traversing the AST, calculate the expected indentation levels of every token according to the
//    OffsetStorage container.
// 4. For each line, compare the expected indentation of the first token to the actual indentation in the file,
//    and report the token if the two values are not equal.

/**
 * A mutable map that stores (key, value) pairs. The keys are numeric indices, and must be unique.
 * This is intended to be a generic wrapper around a map with non-negative integer keys, so that the underlying implementation
 * can easily be swapped out.
 */
class IndexMap<T = any> {
  private _values: (T | undefined)[];

  /**
   * Creates an empty map
   * @param maxKey The maximum key
   */
  public constructor(maxKey: number) {
    // Initializing the array with the maximum expected size avoids dynamic reallocations that could degrade performance.
    this._values = Array(maxKey + 1);
  }

  /**
   * Inserts an entry into the map.
   * @param key The entry's key
   * @param value The entry's value
   */
  public insert(key: number, value: T) {
    this._values[key] = value;
  }

  /**
   * Finds the value of the entry with the largest key less than or equal to the provided key
   * @param key The provided key
   * @returns The value of the found entry, or undefined if no such entry exists.
   */
  public findLastNotAfter(key: number): T | undefined {
    const values = this._values;

    for (let index = key; index >= 0; index--) {
      const value = values[index];

      if (value) return value;
    }
    return undefined;
  }

  /**
   * Deletes all of the keys in the interval [start, end)
   * @param start The start of the range
   * @param end The end of the range
   */
  public deleteRange(start: number, end: number) {
    this._values.fill(undefined, start, end);
  }
}

/**
 * A helper class to get token-based info related to indentation
 */
class TokenInfo {
  private readonly sourceCode: SourceCode;

  public readonly firstTokensByLineNumber: Map<number, Token | Comment>;

  /**
   * @param sourceCode A SourceCode object
   */
  public constructor(sourceCode: SourceCode) {
    this.sourceCode = sourceCode;
    this.firstTokensByLineNumber = new Map();
    const tokens = sourceCode.getTokens(sourceCode.ast, {
      includeComments: true,
    });

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      if (!this.firstTokensByLineNumber.has(token.loc!.start.line))
        this.firstTokensByLineNumber.set(token.loc!.start.line, token);

      if (
        !this.firstTokensByLineNumber.has(token.loc!.end.line) &&
        sourceCode.text
          .slice(token.range![1] - token.loc!.end.column, token.range![1])
          .trim()
      )
        this.firstTokensByLineNumber.set(token.loc!.end.line, token);
    }
  }

  /**
   * Gets the first token on a given token's line
   * @param token a node or token
   * @returns The first token on the given line
   */
  public getFirstTokenOfLine(token: Token | Comment | AST.JSONNode) {
    return this.firstTokensByLineNumber.get(token.loc!.start.line);
  }

  /**
   * Determines whether a token is the first token in its line
   * @param token The token
   * @returns `true` if the token is the first on its line
   */
  public isFirstTokenOfLine(token: Token | Comment | AST.JSONNode) {
    return this.getFirstTokenOfLine(token) === token;
  }

  /**
   * Get the actual indent of a token
   * @param token Token to examine. This should be the first token on its line.
   * @returns The indentation characters that precede the token
   */
  public getTokenIndent(token: Token | Comment) {
    return this.sourceCode.text.slice(
      token.range![0] - token.loc!.start.column,
      token.range![0],
    );
  }
}

/**
 * A class to store information on desired offsets of tokens from each other
 */
class OffsetStorage {
  private readonly _tokenInfo: TokenInfo;

  private readonly _indentSize: number;

  private readonly _indentType: string;

  private readonly _indexMap: IndexMap;

  private readonly _lockedFirstTokens: WeakMap<Token | Comment, Token> =
    new WeakMap();

  private readonly _desiredIndentCache: WeakMap<Token | Comment, string> =
    new WeakMap();

  private readonly _ignoredTokens: WeakSet<Token | Comment> = new WeakSet();

  /**
   * @param tokenInfo a TokenInfo instance
   * @param indentSize The desired size of each indentation level
   * @param indentType The indentation character
   * @param maxIndex The maximum end index of any token
   */
  public constructor(
    tokenInfo: TokenInfo,
    indentSize: number,
    indentType: string,
    maxIndex: number,
  ) {
    this._tokenInfo = tokenInfo;
    this._indentSize = indentSize;
    this._indentType = indentType;

    this._indexMap = new IndexMap(maxIndex);
    this._indexMap.insert(0, { offset: 0, from: null, force: false });
  }

  private _getOffsetDescriptor(token: Token | Comment) {
    return this._indexMap.findLastNotAfter(token.range![0]);
  }

  /**
   * Sets the offset column of token B to match the offset column of token A.
   * - **WARNING**: This matches a *column*, even if baseToken is not the first token on its line. In
   * most cases, `setDesiredOffset` should be used instead.
   * @param baseToken The first token
   * @param offsetToken The second token, whose offset should be matched to the first token
   */
  public matchOffsetOf(baseToken: Token, offsetToken: Token) {
    /**
     * lockedFirstTokens is a map from a token whose indentation is controlled by the "first" option to
     * the token that it depends on. For example, with the `ArrayExpression: first` option, the first
     * token of each element in the array after the first will be mapped to the first token of the first
     * element. The desired indentation of each of these tokens is computed based on the desired indentation
     * of the "first" element, rather than through the normal offset mechanism.
     */
    this._lockedFirstTokens.set(offsetToken, baseToken);
  }

  /**
   * Sets the desired offset of a token.
   *
   * This uses a line-based offset collapsing behavior to handle tokens on the same line.
   * For example, consider the following two cases:
   *
   * (
   *     [
   *         bar
   *     ]
   * )
   *
   * ([
   *     bar
   * ])
   *
   * Based on the first case, it's clear that the `bar` token needs to have an offset of 1 indent level (4 spaces) from
   * the `[` token, and the `[` token has to have an offset of 1 indent level from the `(` token. Since the `(` token is
   * the first on its line (with an indent of 0 spaces), the `bar` token needs to be offset by 2 indent levels (8 spaces)
   * from the start of its line.
   *
   * However, in the second case `bar` should only be indented by 4 spaces. This is because the offset of 1 indent level
   * between the `(` and the `[` tokens gets "collapsed" because the two tokens are on the same line. As a result, the
   * `(` token is mapped to the `[` token with an offset of 0, and the rule correctly decides that `bar` should be indented
   * by 1 indent level from the start of the line.
   *
   * This is useful because rule listeners can usually just call `setDesiredOffset` for all the tokens in the node,
   * without needing to check which lines those tokens are on.
   *
   * Note that since collapsing only occurs when two tokens are on the same line, there are a few cases where non-intuitive
   * behavior can occur. For example, consider the following cases:
   *
   * foo(
   * ).
   *     bar(
   *         baz
   *     )
   *
   * foo(
   * ).bar(
   *     baz
   * )
   *
   * Based on the first example, it would seem that `bar` should be offset by 1 indent level from `foo`, and `baz`
   * should be offset by 1 indent level from `bar`. However, this is not correct, because it would result in `baz`
   * being indented by 2 indent levels in the second case (since `foo`, `bar`, and `baz` are all on separate lines, no
   * collapsing would occur).
   *
   * Instead, the correct way would be to offset `baz` by 1 level from `bar`, offset `bar` by 1 level from the `)`, and
   * offset the `)` by 0 levels from `foo`. This ensures that the offset between `bar` and the `)` are correctly collapsed
   * in the second case.
   * @param token The token
   * @param fromToken The token that `token` should be offset from
   * @param offset The desired indent level
   */
  public setDesiredOffset(
    token: Token | Comment | undefined | null,
    fromToken: Token | Comment | undefined | null,
    offset: Offset,
  ): void {
    if (token) this.setDesiredOffsets(token.range!, fromToken, offset);
  }

  /**
   * Sets the desired offset of all tokens in a range
   * It's common for node listeners in this file to need to apply the same offset to a large, contiguous range of tokens.
   * Moreover, the offset of any given token is usually updated multiple times (roughly once for each node that contains
   * it). This means that the offset of each token is updated O(AST depth) times.
   * It would not be performant to store and update the offsets for each token independently, because the rule would end
   * up having a time complexity of O(number of tokens * AST depth), which is quite slow for large files.
   *
   * Instead, the offset tree is represented as a collection of contiguous offset ranges in a file. For example, the following
   * list could represent the state of the offset tree at a given point:
   *
   * - Tokens starting in the interval [0, 15) are aligned with the beginning of the file
   * - Tokens starting in the interval [15, 30) are offset by 1 indent level from the `bar` token
   * - Tokens starting in the interval [30, 43) are offset by 1 indent level from the `foo` token
   * - Tokens starting in the interval [43, 820) are offset by 2 indent levels from the `bar` token
   * - Tokens starting in the interval [820, ∞) are offset by 1 indent level from the `baz` token
   *
   * The `setDesiredOffsets` methods inserts ranges like the ones above. The third line above would be inserted by using:
   * `setDesiredOffsets([30, 43], fooToken, 1);`
   * @param range A [start, end] pair. All tokens with range[0] <= token.start < range[1] will have the offset applied.
   * @param fromToken The token that this is offset from
   * @param offset The desired indent level
   * @param force `true` if this offset should not use the normal collapsing behavior. This should almost always be false.
   */
  public setDesiredOffsets(
    range: [number, number],
    fromToken: Token | Comment | null | undefined,
    offset: Offset,
    force = false,
  ) {
    /**
     * Offset ranges are stored as a collection of nodes, where each node maps a numeric key to an offset
     * descriptor. The tree for the example above would have the following nodes:
     *
     * key: 0, value: { offset: 0, from: null }
     * key: 15, value: { offset: 1, from: barToken }
     * key: 30, value: { offset: 1, from: fooToken }
     * key: 43, value: { offset: 2, from: barToken }
     * key: 820, value: { offset: 1, from: bazToken }
     *
     * To find the offset descriptor for any given token, one needs to find the node with the largest key
     * which is <= token.start. To make this operation fast, the nodes are stored in a map indexed by key.
     */

    const descriptorToInsert = { offset, from: fromToken, force };

    const descriptorAfterRange = this._indexMap.findLastNotAfter(range[1]);

    const fromTokenIsInRange =
      fromToken &&
      fromToken.range![0] >= range[0] &&
      fromToken.range![1] <= range[1];
    const fromTokenDescriptor =
      fromTokenIsInRange && this._getOffsetDescriptor(fromToken);

    // First, remove any existing nodes in the range from the map.
    this._indexMap.deleteRange(range[0] + 1, range[1]);

    // Insert a new node into the map for this range
    this._indexMap.insert(range[0], descriptorToInsert);

    /**
     * To avoid circular offset dependencies, keep the `fromToken` token mapped to whatever it was mapped to previously,
     * even if it's in the current range.
     */
    if (fromTokenIsInRange) {
      this._indexMap.insert(fromToken.range![0], fromTokenDescriptor);
      this._indexMap.insert(fromToken.range![1], descriptorToInsert);
    }

    /**
     * To avoid modifying the offset of tokens after the range, insert another node to keep the offset of the following
     * tokens the same as it was before.
     */
    this._indexMap.insert(range[1], descriptorAfterRange);
  }

  /**
   * Gets the desired indent of a token
   * @param token The token
   * @returns The desired indent of the token
   */
  public getDesiredIndent(token: Token | Comment) {
    if (!this._desiredIndentCache.has(token)) {
      if (this._ignoredTokens.has(token)) {
        /**
         * If the token is ignored, use the actual indent of the token as the desired indent.
         * This ensures that no errors are reported for this token.
         */
        this._desiredIndentCache.set(
          token,
          this._tokenInfo.getTokenIndent(token),
        );
      } else if (this._lockedFirstTokens.has(token)) {
        const firstToken = this._lockedFirstTokens.get(token)!;

        this._desiredIndentCache.set(
          token,
          // (indentation for the first element's line)
          this.getDesiredIndent(
            this._tokenInfo.getFirstTokenOfLine(firstToken)!,
          ) +
            // (space between the start of the first element's line and the first element)
            this._indentType.repeat(
              firstToken.loc.start.column -
                this._tokenInfo.getFirstTokenOfLine(firstToken)!.loc!.start
                  .column,
            ),
        );
      } else {
        const offsetInfo = this._getOffsetDescriptor(token);
        const offset =
          offsetInfo.from &&
          offsetInfo.from.loc.start.line === token.loc!.start.line &&
          !/^\s*?\n/u.test(token.value) &&
          !offsetInfo.force
            ? 0
            : offsetInfo.offset * this._indentSize;

        this._desiredIndentCache.set(
          token,
          (offsetInfo.from ? this.getDesiredIndent(offsetInfo.from) : "") +
            this._indentType.repeat(offset),
        );
      }
    }
    return this._desiredIndentCache.get(token);
  }

  /**
   * Ignores a token, preventing it from being reported.
   * @param token The token
   */
  public ignoreToken(token: Token | Comment) {
    if (this._tokenInfo.isFirstTokenOfLine(token))
      this._ignoredTokens.add(token);
  }

  /**
   * Gets the first token that the given token's indentation is dependent on
   * @param token The token
   * @returns The token that the given token depends on, or `null` if the given token is at the top level
   */
  public getFirstDependency(token: Token | Comment) {
    return this._getOffsetDescriptor(token).from;
  }
}

const ELEMENT_LIST_SCHEMA: JSONSchema4 = {
  oneOf: [
    {
      type: "integer",
      minimum: 0,
    },
    {
      type: "string",
      enum: ["first", "off"],
    },
  ],
};
export default createRule("indent", {
  meta: {
    docs: {
      description: "enforce consistent indentation",
      recommended: null,
      extensionRule: true,
      layout: true,
    },
    type: "layout",

    fixable: "whitespace",

    schema: [
      {
        oneOf: [
          {
            type: "string",
            enum: ["tab"],
          },
          {
            type: "integer",
            minimum: 0,
          },
        ],
      },
      {
        type: "object",
        properties: {
          SwitchCase: {
            type: "integer",
            minimum: 0,
            default: 0,
          },
          VariableDeclarator: {
            oneOf: [
              ELEMENT_LIST_SCHEMA,
              {
                type: "object",
                properties: {
                  var: ELEMENT_LIST_SCHEMA,
                  let: ELEMENT_LIST_SCHEMA,
                  const: ELEMENT_LIST_SCHEMA,
                },
                additionalProperties: false,
              },
            ],
          },
          outerIIFEBody: {
            oneOf: [
              {
                type: "integer",
                minimum: 0,
              },
              {
                type: "string",
                enum: ["off"],
              },
            ],
          },
          MemberExpression: {
            oneOf: [
              {
                type: "integer",
                minimum: 0,
              },
              {
                type: "string",
                enum: ["off"],
              },
            ],
          },
          FunctionDeclaration: {
            type: "object",
            properties: {
              parameters: ELEMENT_LIST_SCHEMA,
              body: {
                type: "integer",
                minimum: 0,
              },
            },
            additionalProperties: false,
          },
          FunctionExpression: {
            type: "object",
            properties: {
              parameters: ELEMENT_LIST_SCHEMA,
              body: {
                type: "integer",
                minimum: 0,
              },
            },
            additionalProperties: false,
          },
          StaticBlock: {
            type: "object",
            properties: {
              body: {
                type: "integer",
                minimum: 0,
              },
            },
            additionalProperties: false,
          },
          CallExpression: {
            type: "object",
            properties: {
              arguments: ELEMENT_LIST_SCHEMA,
            },
            additionalProperties: false,
          },
          ArrayExpression: ELEMENT_LIST_SCHEMA,
          ObjectExpression: ELEMENT_LIST_SCHEMA,
          ImportDeclaration: ELEMENT_LIST_SCHEMA,
          flatTernaryExpressions: {
            type: "boolean",
            default: false,
          },
          offsetTernaryExpressions: {
            type: "boolean",
            default: false,
          },
          ignoredNodes: {
            type: "array",
            items: {
              type: "string",
              not: {
                pattern: ":exit$",
              },
            },
          },
          ignoreComments: {
            type: "boolean",
            default: false,
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      wrongIndentation:
        "Expected indentation of {{expected}} but found {{actual}}.",
    },
  },
  create(context) {
    const sourceCode = getSourceCode(context);
    if (!sourceCode.parserServices.isJSON) {
      return {};
    }
    const DEFAULT_VARIABLE_INDENT = 1;
    const DEFAULT_PARAMETER_INDENT = 1;
    const DEFAULT_FUNCTION_BODY_INDENT = 1;

    let indentType = "space";
    let indentSize = 4;
    const options = {
      SwitchCase: 0,
      VariableDeclarator: {
        var: DEFAULT_VARIABLE_INDENT as number | "first",
        let: DEFAULT_VARIABLE_INDENT as number | "first",
        const: DEFAULT_VARIABLE_INDENT as number | "first",
      },
      outerIIFEBody: 1,
      FunctionDeclaration: {
        parameters: DEFAULT_PARAMETER_INDENT,
        body: DEFAULT_FUNCTION_BODY_INDENT,
      },
      FunctionExpression: {
        parameters: DEFAULT_PARAMETER_INDENT,
        body: DEFAULT_FUNCTION_BODY_INDENT,
      },
      StaticBlock: {
        body: DEFAULT_FUNCTION_BODY_INDENT,
      },
      CallExpression: {
        arguments: DEFAULT_PARAMETER_INDENT,
      },
      MemberExpression: 1,
      ArrayExpression: 1,
      ObjectExpression: 1,
      ImportDeclaration: 1,
      flatTernaryExpressions: false,
      ignoredNodes: [],
      ignoreComments: false,
      offsetTernaryExpressions: false,
    };

    if (context.options.length) {
      if (context.options[0] === "tab") {
        indentSize = 1;
        indentType = "tab";
      } else {
        indentSize = context.options[0] ?? indentSize;
        indentType = "space";
      }

      const userOptions = context.options[1];
      if (userOptions) {
        Object.assign(options, userOptions);

        if (
          typeof userOptions.VariableDeclarator === "number" ||
          userOptions.VariableDeclarator === "first"
        ) {
          options.VariableDeclarator = {
            var: userOptions.VariableDeclarator,
            let: userOptions.VariableDeclarator,
            const: userOptions.VariableDeclarator,
          };
        }
      }
    }

    const tokenInfo = new TokenInfo(sourceCode);
    const offsets = new OffsetStorage(
      tokenInfo,
      indentSize,
      indentType === "space" ? " " : "\t",
      sourceCode.text.length,
    );
    const parameterParens = new WeakSet();

    /**
     * Creates an error message for a line, given the expected/actual indentation.
     * @param expectedAmount The expected amount of indentation characters for this line
     * @param actualSpaces The actual number of indentation spaces that were found on this line
     * @param actualTabs The actual number of indentation tabs that were found on this line
     * @returns An error message for this line
     */
    function createErrorMessageData(
      expectedAmount: number,
      actualSpaces: number,
      actualTabs: number,
    ): Record<string, string> {
      const expectedStatement = `${expectedAmount} ${indentType}${
        expectedAmount === 1 ? "" : "s"
      }`; // e.g. "2 tabs"
      const foundSpacesWord = `space${actualSpaces === 1 ? "" : "s"}`; // e.g. "space"
      const foundTabsWord = `tab${actualTabs === 1 ? "" : "s"}`; // e.g. "tabs"
      let foundStatement;

      if (actualSpaces > 0) {
        /**
         * Abbreviate the message if the expected indentation is also spaces.
         * e.g. 'Expected 4 spaces but found 2' rather than 'Expected 4 spaces but found 2 spaces'
         */
        foundStatement =
          indentType === "space"
            ? actualSpaces
            : `${actualSpaces} ${foundSpacesWord}`;
      } else if (actualTabs > 0) {
        foundStatement =
          indentType === "tab" ? actualTabs : `${actualTabs} ${foundTabsWord}`;
      } else {
        foundStatement = "0";
      }
      return {
        expected: expectedStatement,
        actual: String(foundStatement),
      };
    }

    /**
     * Reports a given indent violation
     * @param token Token violating the indent rule
     * @param neededIndent Expected indentation string
     */
    function report(token: Token | Comment, neededIndent: string) {
      const actualIndent = Array.from(tokenInfo.getTokenIndent(token));
      const numSpaces = actualIndent.filter((char) => char === " ").length;
      const numTabs = actualIndent.filter((char) => char === "\t").length;

      context.report({
        node: token as any,
        messageId: "wrongIndentation",
        data: createErrorMessageData(neededIndent.length, numSpaces, numTabs),
        loc: {
          start: { line: token.loc!.start.line, column: 0 },
          end: { line: token.loc!.start.line, column: token.loc!.start.column },
        },
        fix(fixer) {
          const range = [
            token.range![0] - token.loc!.start.column,
            token.range![0],
          ] as [number, number];
          const newText = neededIndent;

          return fixer.replaceTextRange(range, newText);
        },
      });
    }

    /**
     * Checks if a token's indentation is correct
     * @param token Token to examine
     * @param desiredIndent Desired indentation of the string
     * @returns `true` if the token's indentation is correct
     */
    function validateTokenIndent(
      token: Token | Comment,
      desiredIndent: string,
    ): boolean {
      const indentation = tokenInfo.getTokenIndent(token);

      return (
        indentation === desiredIndent ||
        // To avoid conflicts with no-mixed-spaces-and-tabs, don't report mixed spaces and tabs.
        (indentation.includes(" ") && indentation.includes("\t"))
      );
    }

    /**
     * Counts the number of linebreaks that follow the last non-whitespace character in a string
     * @param string The string to check
     * @returns The number of JavaScript linebreaks that follow the last non-whitespace character,
     * or the total number of linebreaks if the string is all whitespace.
     */
    function countTrailingLinebreaks(string: string) {
      const trailingWhitespace = /\s*$/u.exec(string)![0];
      const linebreakMatches =
        createGlobalLinebreakMatcher().exec(trailingWhitespace);

      return linebreakMatches === null ? 0 : linebreakMatches.length;
    }

    /**
     * Check indentation for lists of elements (arrays, objects, function params)
     * @param elements List of elements that should be offset
     * @param startToken The start token of the list that element should be aligned against, e.g. '['
     * @param endToken The end token of the list, e.g. ']'
     * @param offset The amount that the elements should be offset
     */
    function addElementListIndent(
      elements: (AST.JSONNode | null)[],
      startToken: Token,
      endToken: Token,
      offset: number | string,
    ) {
      /**
       * Gets the first token of a given element, including surrounding parentheses.
       * @param element A node in the `elements` list
       * @returns The first token of this element
       */
      function getFirstToken(element: AST.JSONNode) {
        let token: Token = sourceCode.getTokenBefore(element as any)!;

        while (isOpeningParenToken(token) && token !== startToken)
          token = sourceCode.getTokenBefore(token)!;

        return sourceCode.getTokenAfter(token)!;
      }

      // Run through all the tokens in the list, and offset them by one indent level (mainly for comments, other things will end up overridden)
      offsets.setDesiredOffsets(
        [startToken.range[1], endToken.range[0]],
        startToken,
        typeof offset === "number" ? offset : 1,
      );
      offsets.setDesiredOffset(endToken, startToken, 0);

      // If the preference is "first" but there is no first element (e.g. sparse arrays w/ empty first slot), fall back to 1 level.
      if (offset === "first" && elements.length && !elements[0]) return;

      elements.forEach((element, index) => {
        if (!element) {
          // Skip holes in arrays
          return;
        }
        if (offset === "off") {
          // Ignore the first token of every element if the "off" option is used
          offsets.ignoreToken(getFirstToken(element));
        }

        // Offset the following elements correctly relative to the first element
        if (index === 0) return;

        if (
          offset === "first" &&
          tokenInfo.isFirstTokenOfLine(getFirstToken(element))
        ) {
          offsets.matchOffsetOf(
            getFirstToken(elements[0]!),
            getFirstToken(element),
          );
        } else {
          const previousElement = elements[index - 1]!;
          const firstTokenOfPreviousElement =
            previousElement && getFirstToken(previousElement);
          const previousElementLastToken =
            previousElement && sourceCode.getLastToken(previousElement as any)!;

          if (
            previousElement &&
            previousElementLastToken.loc.end.line -
              countTrailingLinebreaks(previousElementLastToken.value) >
              startToken.loc.end.line
          ) {
            offsets.setDesiredOffsets(
              [previousElement.range[1], element.range[1]],
              firstTokenOfPreviousElement,
              0,
            );
          }
        }
      });
    }

    /**
     * Checks the indentation of parenthesized values, given a list of tokens in a program
     * @param tokens A list of tokens
     */
    function addParensIndent(tokens: Token[]) {
      const parenStack = [];
      const parenPairs = [];

      for (let i = 0; i < tokens.length; i++) {
        const nextToken = tokens[i];

        if (isOpeningParenToken(nextToken)) parenStack.push(nextToken);
        else if (isClosingParenToken(nextToken))
          parenPairs.push({ left: parenStack.pop(), right: nextToken });
      }

      for (let i = parenPairs.length - 1; i >= 0; i--) {
        const leftParen = parenPairs[i].left!;
        const rightParen = parenPairs[i].right;

        // We only want to handle parens around expressions, so exclude parentheses that are in function parameters and function call arguments.
        if (
          !parameterParens.has(leftParen) &&
          !parameterParens.has(rightParen)
        ) {
          const parenthesizedTokens = new Set(
            sourceCode.getTokensBetween(leftParen, rightParen),
          );

          parenthesizedTokens.forEach((token) => {
            if (!parenthesizedTokens.has(offsets.getFirstDependency(token)))
              offsets.setDesiredOffset(token, leftParen, 1);
          });
        }

        offsets.setDesiredOffset(rightParen, leftParen, 0);
      }
    }

    /**
     * Ignore all tokens within an unknown node whose offset do not depend
     * on another token's offset within the unknown node
     * @param node Unknown Node
     */
    function ignoreNode(node: AST.JSONNode) {
      const unknownNodeTokens = new Set(
        sourceCode.getTokens(node as any, { includeComments: true }),
      );

      unknownNodeTokens.forEach((token) => {
        if (!unknownNodeTokens.has(offsets.getFirstDependency(token))) {
          const firstTokenOfLine = tokenInfo.getFirstTokenOfLine(token)!;

          if (token === firstTokenOfLine) offsets.ignoreToken(token);
          else offsets.setDesiredOffset(token, firstTokenOfLine, 0);
        }
      });
    }

    /**
     * Check whether there are any blank (whitespace-only) lines between
     * two tokens on separate lines.
     * @param firstToken The first token.
     * @param secondToken The second token.
     * @returns `true` if the tokens are on separate lines and
     *   there exists a blank line between them, `false` otherwise.
     */
    function hasBlankLinesBetween(
      firstToken: Token | Comment,
      secondToken: Token | Comment,
    ): boolean {
      const firstTokenLine = firstToken.loc!.end.line;
      const secondTokenLine = secondToken.loc!.start.line;

      if (
        firstTokenLine === secondTokenLine ||
        firstTokenLine === secondTokenLine - 1
      )
        return false;

      for (let line = firstTokenLine + 1; line < secondTokenLine; ++line) {
        if (!tokenInfo.firstTokensByLineNumber.has(line)) return true;
      }

      return false;
    }

    const ignoredNodeFirstTokens = new Set<Token>();

    const baseOffsetListeners: RuleListener = {
      JSONArrayExpression(node) {
        const openingBracket = sourceCode.getFirstToken(node as any)!;
        const closingBracket = sourceCode.getTokenAfter(
          ([...node.elements].reverse().find((_) => _) as any) ||
            openingBracket,
          isClosingBracketToken,
        )!;

        addElementListIndent(
          node.elements,
          openingBracket,
          closingBracket,
          options.ArrayExpression,
        );
      },

      JSONObjectExpression(node) {
        const openingCurly = sourceCode.getFirstToken(node as any)!;
        const closingCurly = sourceCode.getTokenAfter(
          node.properties.length
            ? (node.properties[node.properties.length - 1] as any)
            : openingCurly,
          isClosingBraceToken,
        )!;

        addElementListIndent(
          node.properties,
          openingCurly,
          closingCurly,
          options.ObjectExpression,
        );
      },

      JSONBinaryExpression(node) {
        const operator = sourceCode.getFirstTokenBetween(
          node.left as any,
          node.right as any,
          (token) => token.value === node.operator,
        )!;

        /**
         * For backwards compatibility, don't check BinaryExpression indents, e.g.
         * var foo = bar &&
         *                   baz;
         */

        const tokenAfterOperator = sourceCode.getTokenAfter(operator)!;

        offsets.ignoreToken(operator);
        offsets.ignoreToken(tokenAfterOperator);
        offsets.setDesiredOffset(tokenAfterOperator, operator, 0);
      },

      JSONProperty(node) {
        if (!node.shorthand && !node.method && node.kind === "init") {
          const colon = sourceCode.getFirstTokenBetween(
            node.key as any,
            node.value as any,
            isColonToken,
          )!;

          offsets.ignoreToken(sourceCode.getTokenAfter(colon)!);
        }
      },

      JSONTemplateLiteral(node) {
        node.expressions.forEach((_expression, index) => {
          const previousQuasi = node.quasis[index];
          const nextQuasi = node.quasis[index + 1];
          const tokenToAlignFrom =
            previousQuasi.loc.start.line === previousQuasi.loc.end.line
              ? sourceCode.getFirstToken(previousQuasi as any)
              : null;

          offsets.setDesiredOffsets(
            [previousQuasi.range[1], nextQuasi.range[0]],
            tokenToAlignFrom,
            1,
          );
          offsets.setDesiredOffset(
            sourceCode.getFirstToken(nextQuasi as any),
            tokenToAlignFrom,
            0,
          );
        });
      },

      "*"(node: AST.JSONNode) {
        const firstToken = sourceCode.getFirstToken(node as any);

        // Ensure that the children of every node are indented at least as much as the first token.
        if (firstToken && !ignoredNodeFirstTokens.has(firstToken))
          offsets.setDesiredOffsets(node.range, firstToken, 0);
      },
    };

    const listenerCallQueue: {
      listener?: (node: any) => void;
      node: AST.JSONNode;
    }[] = [];

    /**
     * To ignore the indentation of a node:
     * 1. Don't call the node's listener when entering it (if it has a listener)
     * 2. Don't set any offsets against the first token of the node.
     * 3. Call `ignoreNode` on the node sometime after exiting it and before validating offsets.
     */
    const offsetListeners: Record<string, (node: AST.JSONNode) => void> = {};

    for (const [selector, listener] of Object.entries(baseOffsetListeners)) {
      /**
       * Offset listener calls are deferred until traversal is finished, and are called as
       * part of the final `Program:exit` listener. This is necessary because a node might
       * be matched by multiple selectors.
       *
       * Example: Suppose there is an offset listener for `Identifier`, and the user has
       * specified in configuration that `MemberExpression > Identifier` should be ignored.
       * Due to selector specificity rules, the `Identifier` listener will get called first. However,
       * if a given Identifier node is supposed to be ignored, then the `Identifier` offset listener
       * should not have been called at all. Without doing extra selector matching, we don't know
       * whether the Identifier matches the `MemberExpression > Identifier` selector until the
       * `MemberExpression > Identifier` listener is called.
       *
       * To avoid this, the `Identifier` listener isn't called until traversal finishes and all
       * ignored nodes are known.
       */
      offsetListeners[selector] = (node) =>
        listenerCallQueue.push({
          listener: listener as any,
          node,
        });
    }

    // For each ignored node selector, set up a listener to collect it into the `ignoredNodes` set.
    const ignoredNodes = new Set<AST.JSONNode>();

    /**
     * Ignores a node
     * @param node The node to ignore
     */
    function addToIgnoredNodes(node: AST.JSONNode): void {
      ignoredNodes.add(node);
      ignoredNodeFirstTokens.add(sourceCode.getFirstToken(node as any)!);
    }

    const ignoredNodeListeners = options.ignoredNodes.reduce(
      (listeners, ignoredSelector) =>
        Object.assign(listeners, { [ignoredSelector]: addToIgnoredNodes }),
      {},
    );

    /**
     * Join the listeners, and add a listener to verify that all tokens actually have the correct indentation
     * at the end.
     *
     * Using Object.assign will cause some offset listeners to be overwritten if the same selector also appears
     * in `ignoredNodeListeners`. This isn't a problem because all of the matching nodes will be ignored,
     * so those listeners wouldn't be called anyway.
     */
    return Object.assign(offsetListeners, ignoredNodeListeners, {
      "*:exit"(node: AST.JSONNode) {
        // If a node's type is nonstandard, we can't tell how its children should be offset, so ignore it.
        if (!KNOWN_NODES.has(node.type)) addToIgnoredNodes(node);
      },
      "Program:exit"() {
        // If ignoreComments option is enabled, ignore all comment tokens.
        if (options.ignoreComments) {
          sourceCode
            .getAllComments()
            .forEach((comment) => offsets.ignoreToken(comment));
        }

        // Invoke the queued offset listeners for the nodes that aren't ignored.
        for (let i = 0; i < listenerCallQueue.length; i++) {
          const nodeInfo = listenerCallQueue[i];

          if (!ignoredNodes.has(nodeInfo.node))
            nodeInfo.listener?.(nodeInfo.node);
        }

        // Update the offsets for ignored nodes to prevent their child tokens from being reported.
        ignoredNodes.forEach(ignoreNode);

        addParensIndent(sourceCode.ast.tokens);

        /**
         * Create a Map from (tokenOrComment) => (precedingToken).
         * This is necessary because sourceCode.getTokenBefore does not handle a comment as an argument correctly.
         */
        const precedingTokens = new WeakMap();

        for (let i = 0; i < sourceCode.ast.comments.length; i++) {
          const comment = sourceCode.ast.comments[i];

          const tokenOrCommentBefore = sourceCode.getTokenBefore(comment, {
            includeComments: true,
          })!;
          const hasToken = precedingTokens.has(tokenOrCommentBefore)
            ? precedingTokens.get(tokenOrCommentBefore)
            : tokenOrCommentBefore;

          precedingTokens.set(comment, hasToken);
        }

        for (let i = 1; i < sourceCode.lines.length + 1; i++) {
          if (!tokenInfo.firstTokensByLineNumber.has(i)) {
            // Don't check indentation on blank lines
            continue;
          }

          const firstTokenOfLine = tokenInfo.firstTokensByLineNumber.get(i)!;

          if (firstTokenOfLine.loc!.start.line !== i) {
            // Don't check the indentation of multi-line tokens (e.g. template literals or block comments) twice.
            continue;
          }

          if (isCommentToken(firstTokenOfLine)) {
            const tokenBefore = precedingTokens.get(firstTokenOfLine);
            const tokenAfter = tokenBefore
              ? sourceCode.getTokenAfter(tokenBefore)
              : sourceCode.ast.tokens[0];
            const mayAlignWithBefore =
              tokenBefore &&
              !hasBlankLinesBetween(tokenBefore, firstTokenOfLine);
            const mayAlignWithAfter =
              tokenAfter && !hasBlankLinesBetween(firstTokenOfLine, tokenAfter);

            /**
             * If a comment precedes a line that begins with a semicolon token, align to that token, i.e.
             *
             * let foo
             * // comment
             * ;(async () => {})()
             */
            if (
              tokenAfter &&
              isSemicolonToken(tokenAfter) &&
              !isTokenOnSameLine(firstTokenOfLine, tokenAfter)
            )
              offsets.setDesiredOffset(firstTokenOfLine, tokenAfter, 0);

            // If a comment matches the expected indentation of the token immediately before or after, don't report it.
            if (
              (mayAlignWithBefore &&
                validateTokenIndent(
                  firstTokenOfLine,
                  offsets.getDesiredIndent(tokenBefore)!,
                )) ||
              (mayAlignWithAfter &&
                validateTokenIndent(
                  firstTokenOfLine,
                  offsets.getDesiredIndent(tokenAfter)!,
                ))
            )
              continue;
          }

          // If the token matches the expected indentation, don't report it.
          if (
            validateTokenIndent(
              firstTokenOfLine,
              offsets.getDesiredIndent(firstTokenOfLine)!,
            )
          )
            continue;

          // Otherwise, report the token/comment.
          report(firstTokenOfLine, offsets.getDesiredIndent(firstTokenOfLine)!);
        }
      },
    });
  },
});
