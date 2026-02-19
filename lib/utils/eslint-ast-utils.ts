// Most source code was copied from ESLint v8.
// MIT License. Copyright OpenJS Foundation and other contributors, <www.openjsf.org>
import type { AST } from "jsonc-eslint-parser";
import { getStaticJSONValue } from "jsonc-eslint-parser";
import type { Comment, Token } from "../types.ts";
import { latestEcmaVersion, tokenize } from "espree";

export const LINEBREAKS = new Set(["\r\n", "\r", "\n", "\u2028", "\u2029"]);
export const LINEBREAK_MATCHER = /\r\n|[\n\r\u2028\u2029]/u;

/**
 * Creates a version of the `lineBreakPattern` regex with the global flag.
 * Global regexes are mutable, so this needs to be a function instead of a constant.
 * @returns A global regular expression that matches line terminators
 */
export function createGlobalLinebreakMatcher(): RegExp {
  return new RegExp(LINEBREAK_MATCHER.source, "gu");
}

/**
 * Determines whether two tokens can safely be placed next to each other without merging into a single token
 * @param leftValue The left token. If this is a string, it will be tokenized and the last token will be used.
 * @param rightValue The right token. If this is a string, it will be tokenized and the first token will be used.
 * @returns If the tokens cannot be safely placed next to each other, returns `false`. If the tokens can be placed
 * next to each other, behavior is undefined (although it should return `true` in most cases).
 */
export function canTokensBeAdjacent(
  leftValue: Token | string,
  rightValue: Token | string,
): boolean {
  const espreeOptions = {
    comment: true,
    ecmaVersion: latestEcmaVersion,
    range: true,
  };

  let leftToken;

  if (typeof leftValue === "string") {
    let tokens;

    try {
      tokens = tokenize(leftValue, espreeOptions);
    } catch {
      return false;
    }

    const comments = tokens.comments!;

    leftToken = tokens[tokens.length - 1];
    if (comments.length) {
      const lastComment = comments[comments.length - 1];

      if (!leftToken || lastComment.range![0] > leftToken.range![0])
        leftToken = lastComment;
    }
  } else {
    leftToken = leftValue;
  }

  /**
   * If a hashbang comment was passed as a token object from SourceCode,
   * its type will be "Shebang" because of the way ESLint itself handles hashbangs.
   * If a hashbang comment was passed in a string and then tokenized in this function,
   * its type will be "Hashbang" because of the way Espree tokenizes hashbangs.
   */
  if (leftToken.type === "Shebang" || leftToken.type === "Hashbang")
    return false;

  let rightToken;

  if (typeof rightValue === "string") {
    let tokens;

    try {
      tokens = tokenize(rightValue, espreeOptions);
    } catch {
      return false;
    }

    const comments = tokens.comments!;

    rightToken = tokens[0];
    if (comments.length) {
      const firstComment = comments[0];

      if (!rightToken || firstComment.range![0] < rightToken.range![0])
        rightToken = firstComment;
    }
  } else {
    rightToken = rightValue;
  }

  if (leftToken.type === "Punctuator" || rightToken.type === "Punctuator") {
    if (leftToken.type === "Punctuator" && rightToken.type === "Punctuator") {
      const PLUS_TOKENS = new Set(["+", "++"]);
      const MINUS_TOKENS = new Set(["-", "--"]);

      return !(
        (PLUS_TOKENS.has(leftToken.value) &&
          PLUS_TOKENS.has(rightToken.value)) ||
        (MINUS_TOKENS.has(leftToken.value) &&
          MINUS_TOKENS.has(rightToken.value))
      );
    }
    if (leftToken.type === "Punctuator" && leftToken.value === "/")
      return !["Block", "Line", "RegularExpression"].includes(rightToken.type);

    return true;
  }

  if (
    leftToken.type === "String" ||
    rightToken.type === "String" ||
    leftToken.type === "Template" ||
    rightToken.type === "Template"
  )
    return true;

  if (
    leftToken.type !== "Numeric" &&
    rightToken.type === "Numeric" &&
    rightToken.value.startsWith(".")
  )
    return true;

  if (
    leftToken.type === "Block" ||
    rightToken.type === "Block" ||
    rightToken.type === "Line"
  )
    return true;

  if (rightToken.type === "PrivateIdentifier") return true;

  return false;
}

/**
 * Validate that a string passed in is surrounded by the specified character
 * @param val The text to check.
 * @param character The character to see if it's surrounded by.
 * @returns True if the text is surrounded by the character, false if not.
 * @private
 */
export function isSurroundedBy(val: string, character: string): boolean {
  return val.startsWith(character) && val.endsWith(character);
}

/**
 * Check if a given node is a numeric literal or not.
 * @param node The node to check.
 * @returns `true` if the node is a number or bigint literal.
 */
export function isNumericLiteral(
  node: AST.JSONNode,
): node is AST.JSONNumberLiteral | AST.JSONBigIntLiteral {
  return (
    node.type === "JSONLiteral" &&
    (typeof node.value === "number" || Boolean("bigint" in node && node.bigint))
  );
}

/**
 * Determines whether two adjacent tokens are on the same line.
 * @param left The left token object.
 * @param right The right token object.
 * @returns Whether or not the tokens are on the same line.
 * @public
 */
export function isTokenOnSameLine(
  left: Token | Comment | AST.JSONNode | null,
  right: Token | Comment | AST.JSONNode | null,
): boolean {
  return left?.loc?.end.line === right?.loc?.start.line;
}

export function getStaticPropertyName(node: AST.JSONProperty): string;
export function getStaticPropertyName(node: AST.JSONNode): string | null;
/**
 * Gets the property name of a given node.
 * The node can be a MemberExpression, a Property, or a MethodDefinition.
 *
 * If the name is dynamic, this returns `null`.
 *
 * For examples:
 *
 *     a.b           // => "b"
 *     a["b"]        // => "b"
 *     a['b']        // => "b"
 *     a[`b`]        // => "b"
 *     a[100]        // => "100"
 *     a[b]          // => null
 *     a["a" + "b"]  // => null
 *     a[tag`b`]     // => null
 *     a[`${b}`]     // => null
 *
 *     let a = {b: 1}            // => "b"
 *     let a = {["b"]: 1}        // => "b"
 *     let a = {['b']: 1}        // => "b"
 *     let a = {[`b`]: 1}        // => "b"
 *     let a = {[100]: 1}        // => "100"
 *     let a = {[b]: 1}          // => null
 *     let a = {["a" + "b"]: 1}  // => null
 *     let a = {[tag`b`]: 1}     // => null
 *     let a = {[`${b}`]: 1}     // => null
 * @param node The node to get.
 * @returns The property name if static. Otherwise, null.
 */
export function getStaticPropertyName(node: AST.JSONNode): string | null {
  let prop;

  if (node) {
    switch (node.type) {
      case "JSONProperty":
        prop = node.key;
        break;
      default:
        return null;
    }
  }

  if (prop) {
    if (prop.type === "JSONIdentifier") return prop.name;

    return String(getStaticJSONValue(prop));
  }

  return null;
}

/**
 * Gets next location when the result is not out of bound, otherwise returns null.
 *
 * Assumptions:
 *
 * - The given location represents a valid location in the given source code.
 * - Columns are 0-based.
 * - Lines are 1-based.
 * - Column immediately after the last character in a line (not incl. linebreaks) is considered to be a valid location.
 * - If the source code ends with a linebreak, `sourceCode.lines` array will have an extra element (empty string) at the end.
 *   The start (column 0) of that extra line is considered to be a valid location.
 *
 * Examples of successive locations (line, column):
 *
 * code: foo
 * locations: (1, 0) -> (1, 1) -> (1, 2) -> (1, 3) -> null
 *
 * code: foo<LF>
 * locations: (1, 0) -> (1, 1) -> (1, 2) -> (1, 3) -> (2, 0) -> null
 *
 * code: foo<CR><LF>
 * locations: (1, 0) -> (1, 1) -> (1, 2) -> (1, 3) -> (2, 0) -> null
 *
 * code: a<LF>b
 * locations: (1, 0) -> (1, 1) -> (2, 0) -> (2, 1) -> null
 *
 * code: a<LF>b<LF>
 * locations: (1, 0) -> (1, 1) -> (2, 0) -> (2, 1) -> (3, 0) -> null
 *
 * code: a<CR><LF>b<CR><LF>
 * locations: (1, 0) -> (1, 1) -> (2, 0) -> (2, 1) -> (3, 0) -> null
 *
 * code: a<LF><LF>
 * locations: (1, 0) -> (1, 1) -> (2, 0) -> (3, 0) -> null
 *
 * code: <LF>
 * locations: (1, 0) -> (2, 0) -> null
 *
 * code:
 * locations: (1, 0) -> null
 * @param sourceCode The sourceCode
 * @param location The location
 * @returns Next location
 */
export function getNextLocation(
  sourceCode: { lines: string[] },
  { column, line }: { column: number; line: number },
): { column: number; line: number } | null {
  if (column < sourceCode.lines[line - 1].length) {
    return {
      column: column + 1,
      line,
    };
  }

  if (line < sourceCode.lines.length) {
    return {
      column: 0,
      line: line + 1,
    };
  }

  return null;
}
