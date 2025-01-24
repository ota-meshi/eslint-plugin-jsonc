import {
  isClosingBraceToken,
  isClosingBracketToken,
  isClosingParenToken,
  isCommaToken,
  isCommentToken,
  isNotCommaToken,
  isOpeningParenToken,
} from "@eslint-community/eslint-utils";
import type { Rule, AST as ESLintAST, SourceCode } from "eslint";
import type { AST } from "jsonc-eslint-parser";
import type * as ESTree from "estree";

/**
 * Check if the token is a comma.
 */
function isComma(token: ESLintAST.Token): boolean {
  return isCommaToken(token);
}

/**
 * Check if the token is a closing brace.
 */
function isClosingBrace(token: ESLintAST.Token): boolean {
  return isClosingBraceToken(token);
}

/**
 * Check if the token is a closing bracket.
 */
function isClosingBracket(token: ESLintAST.Token): boolean {
  return isClosingBracketToken(token);
}

export type AroundTarget =
  | {
      before: ESLintAST.Token;
      after: ESLintAST.Token;
      node?: AST.JSONNode | undefined;
    }
  | {
      before: ESLintAST.Token;
      after: ESLintAST.Token;
      node?: undefined;
    };
type NodeTarget = { node: AST.JSONNode; before?: undefined; after?: undefined };
type Target = NodeTarget | AroundTarget;
/**
 * Fixed target element for sorting.
 */
export function* fixForSorting(
  fixer: Rule.RuleFixer,
  sourceCode: SourceCode,
  target: Target,
  to: Target,
): IterableIterator<Rule.Fix> {
  const targetInfo = calcTargetInfo(sourceCode, target);

  const toPrevInfo = getPrevElementInfo(sourceCode, to);

  if (
    toPrevInfo.comma &&
    toPrevInfo.last.range![1] <= toPrevInfo.comma.range[0]
  ) {
    yield fixer.removeRange(toPrevInfo.comma.range);
  }

  let insertRange = [
    toPrevInfo.last.range![1],
    toPrevInfo.last.range![1],
  ] as ESLintAST.Range;
  const toBeforeNextToken = sourceCode.getTokenAfter(toPrevInfo.last, {
    includeComments: true,
  })!;
  if (toBeforeNextToken.loc!.start.line - toPrevInfo.last.loc!.end.line > 1) {
    // If there are blank lines, the element is inserted after the blank lines.
    const offset = sourceCode.getIndexFromLoc({
      line: toBeforeNextToken.loc!.start.line - 1,
      column: 0,
    });
    insertRange = [offset, offset];
  }
  yield fixer.insertTextAfterRange(insertRange, targetInfo.insertCode);

  for (const removeRange of targetInfo.removeRanges) {
    yield fixer.removeRange(removeRange);
  }
}

/**
 * Calculate the fix information of the target.
 */
function calcTargetInfo(
  sourceCode: SourceCode,
  target: Target,
): {
  insertCode: string;
  removeRanges: ESLintAST.Range[];
} {
  const nodeEndIndex = target.node
    ? getLastTokenOfNode(sourceCode, target.node).range[1]
    : target.after.range[0];

  const endInfo = getElementEndInfo(sourceCode, target);
  const prevInfo = getPrevElementInfo(sourceCode, target);

  let insertCode: string;

  const removeRanges: ESLintAST.Range[] = [];
  if (prevInfo.comma && prevInfo.last.range![1] <= prevInfo.comma.range[0]) {
    insertCode = `${sourceCode.text.slice(
      prevInfo.last.range![1],
      prevInfo.comma.range[0],
    )}${sourceCode.text.slice(prevInfo.comma.range[1], nodeEndIndex)}`;
    removeRanges.push(
      [prevInfo.last.range![1], prevInfo.comma.range[0]],
      [prevInfo.comma.range[1], nodeEndIndex],
    );
  } else {
    insertCode = sourceCode.text.slice(prevInfo.last.range![1], nodeEndIndex);
    removeRanges.push([prevInfo.last.range![1], nodeEndIndex]);
  }

  const hasTrailingComma =
    endInfo.comma && endInfo.comma.range[1] <= endInfo.last.range![1];
  if (!hasTrailingComma) {
    insertCode += ",";
    if (prevInfo.comma) {
      removeRanges.push(prevInfo.comma.range);
    }
  }
  insertCode += sourceCode.text.slice(nodeEndIndex, endInfo.last.range![1]);
  removeRanges.push([nodeEndIndex, endInfo.last.range![1]]);

  return {
    insertCode,
    removeRanges,
  };
}

/**
 * Get the first token of the node.
 */
function getFirstTokenOfNode(
  sourceCode: SourceCode,
  node: AST.JSONNode | ESLintAST.Token,
): ESLintAST.Token {
  let token = sourceCode.getFirstToken(node as never)!;
  let target: ESLintAST.Token | null = token;
  while (
    (target = sourceCode.getTokenBefore(token)) &&
    isOpeningParenToken(target)
  ) {
    token = target;
  }
  return token;
}

/**
 * Get the last token of the node.
 */
function getLastTokenOfNode(
  sourceCode: SourceCode,
  node: AST.JSONNode | ESLintAST.Token,
): ESLintAST.Token {
  let token = sourceCode.getLastToken(node as never)!;
  let target: ESLintAST.Token | null = token;
  while (
    (target = sourceCode.getTokenAfter(token)) &&
    isClosingParenToken(target)
  ) {
    token = target;
  }
  return token;
}

/**
 * Get the end of the target element and the next element and token information.
 */
function getElementEndInfo(
  sourceCode: SourceCode,
  target: Target | { node: ESLintAST.Token },
): {
  // Trailing comma
  comma: ESLintAST.Token | null;
  // Next element token
  nextElement: ESLintAST.Token | null;
  // The last token of the target element
  last: ESLintAST.Token | ESTree.Comment;
} {
  const afterToken = target.node
    ? sourceCode.getTokenAfter(getLastTokenOfNode(sourceCode, target.node))!
    : target.after;
  if (isNotCommaToken(afterToken)) {
    // If there is no comma, the element is the last element.
    return {
      comma: null,
      nextElement: null,
      last: getLastTokenWithTrailingComments(sourceCode, target),
    };
  }
  const comma = afterToken;
  const nextElement = sourceCode.getTokenAfter(afterToken)!;
  if (isComma(nextElement)) {
    // If the next element is empty,
    // the position of the comma is the end of the element's range.
    return {
      comma,
      nextElement: null,
      last: comma,
    };
  }
  if (isClosingBrace(nextElement) || isClosingBracket(nextElement)) {
    // If the next token is a closing brace or bracket,
    // the position of the comma is the end of the element's range.
    return {
      comma,
      nextElement: null,
      last: getLastTokenWithTrailingComments(sourceCode, target),
    };
  }

  const node = target.node;

  if (node && node.loc.end.line === nextElement.loc.start.line) {
    // There is no line break between the target element and the next element.
    return {
      comma,
      nextElement,
      last: comma,
    };
  }
  // There are line breaks between the target element and the next element.
  if (
    node &&
    node.loc.end.line < comma.loc.start.line &&
    comma.loc.end.line < nextElement.loc.start.line
  ) {
    // If there is a line break between the target element and a comma and the next element,
    // the position of the comma is the end of the element's range.
    return {
      comma,
      nextElement,
      last: comma,
    };
  }

  return {
    comma,
    nextElement,
    last: getLastTokenWithTrailingComments(sourceCode, target),
  };
}

/**
 * Get the last token of the target element with trailing comments.
 */
function getLastTokenWithTrailingComments(
  sourceCode: SourceCode,
  target: Target | { node: ESLintAST.Token },
) {
  if (!target.node) {
    return sourceCode.getTokenBefore(target.after, {
      includeComments: true,
    })!;
  }
  const node = target.node;
  let last: ESLintAST.Token | ESTree.Comment = getLastTokenOfNode(
    sourceCode,
    node,
  );
  let after: ESLintAST.Token | ESTree.Comment | null;
  while (
    (after = sourceCode.getTokenAfter(last, {
      includeComments: true,
    })) &&
    (isCommentToken(after) || isComma(after)) &&
    node.loc.end.line === after.loc!.end.line
  ) {
    last = after;
  }
  return last;
}

/**
 * Get the previous element and token information.
 */
function getPrevElementInfo(
  sourceCode: SourceCode,
  target: Target,
): {
  // Leading comma
  comma: ESLintAST.Token | null;
  // Previous element token
  prevElement: ESLintAST.Token | null;
  // The last token of the target element
  last: ESLintAST.Token | ESTree.Comment;
} {
  const beforeToken = target.node
    ? sourceCode.getTokenBefore(getFirstTokenOfNode(sourceCode, target.node))!
    : target.before;
  if (isNotCommaToken(beforeToken)) {
    // If there is no comma, the element is the first element.
    return {
      comma: null,
      prevElement: null,
      last: beforeToken,
    };
  }
  const comma = beforeToken;
  const prevElement = sourceCode.getTokenBefore(beforeToken)!;

  if (isComma(prevElement)) {
    // If the previous element is empty,
    // the position of the comma is the end of the previous element's range.
    return {
      comma,
      prevElement: null,
      last: comma,
    };
  }

  const endInfo = getElementEndInfo(sourceCode, { node: prevElement });

  return {
    comma: endInfo.comma,
    prevElement,
    last: endInfo.last,
  };
}
