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
 * Fixed by moving the target element down for sorting.
 */
export function* fixToMoveDownForSorting(
  fixer: Rule.RuleFixer,
  sourceCode: SourceCode,
  target: Target,
  to: Target,
): IterableIterator<Rule.Fix> {
  const targetInfo = calcTargetMoveDownInfo(sourceCode, target);

  const toEndInfo = getElementEndInfo(sourceCode, to);

  let { insertCode, removeRanges, hasLeadingComma } = targetInfo;
  if (toEndInfo.trailingComma) {
    if (
      hasLeadingComma &&
      toEndInfo.last.range![1] <= toEndInfo.trailingComma.range[0]
    ) {
      yield fixer.removeRange(toEndInfo.trailingComma.range);
    }
    hasLeadingComma = true;
    insertCode = targetInfo.withTrailingComma.insertCode;
    removeRanges = targetInfo.withTrailingComma.removeRanges;
  }

  let insertRange = [
    toEndInfo.last.range![1],
    toEndInfo.last.range![1],
  ] as ESLintAST.Range;
  const toNextToken = sourceCode.getTokenAfter(toEndInfo.last, {
    includeComments: true,
  })!;
  if (toNextToken.loc!.start.line - toEndInfo.last.loc!.end.line > 1) {
    // If there are blank lines, the element is inserted after the blank lines.
    const offset = sourceCode.getIndexFromLoc({
      line: toNextToken.loc!.start.line - 1,
      column: 0,
    });
    insertRange = [offset, offset];
  }
  if (!hasLeadingComma) {
    if (to.node) {
      yield fixer.insertTextAfterRange(
        getLastTokenOfNode(sourceCode, to.node).range,
        ",",
      );
    } else {
      yield fixer.insertTextBeforeRange(to.after.range, ",");
    }
  }
  yield fixer.insertTextAfterRange(insertRange, insertCode);

  for (const removeRange of removeRanges) {
    yield fixer.removeRange(removeRange);
  }
}

/**
 * Fixed by moving the target element up for sorting.
 */
export function* fixToMoveUpForSorting(
  fixer: Rule.RuleFixer,
  sourceCode: SourceCode,
  target: Target,
  to: Target,
): IterableIterator<Rule.Fix> {
  const targetInfo = calcTargetMoveUpInfo(sourceCode, target);

  const toPrevInfo = getPrevElementInfo(sourceCode, to);

  if (
    toPrevInfo.leadingComma &&
    toPrevInfo.prevLast.range![1] <= toPrevInfo.leadingComma.range[0]
  ) {
    yield fixer.removeRange(toPrevInfo.leadingComma.range);
  }

  let insertRange = [
    toPrevInfo.prevLast.range![1],
    toPrevInfo.prevLast.range![1],
  ] as ESLintAST.Range;
  const toBeforeNextToken = sourceCode.getTokenAfter(toPrevInfo.prevLast, {
    includeComments: true,
  })!;
  if (
    toBeforeNextToken.loc!.start.line - toPrevInfo.prevLast.loc!.end.line >
    1
  ) {
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
 * Calculate the fix information of the target element to be moved down for sorting.
 */
function calcTargetMoveDownInfo(
  sourceCode: SourceCode,
  target: Target,
): {
  insertCode: string;
  removeRanges: ESLintAST.Range[];
  hasLeadingComma: boolean;
  withTrailingComma: {
    insertCode: string;
    removeRanges: ESLintAST.Range[];
  };
} {
  const nodeStartIndex = target.node
    ? getFirstTokenOfNode(sourceCode, target.node).range[0]
    : target.before.range[1];

  const endInfo = getElementEndInfo(sourceCode, target);
  const prevInfo = getPrevElementInfo(sourceCode, target);

  let insertCode = sourceCode.text.slice(
    prevInfo.prevLast.range![1],
    nodeStartIndex,
  );
  const removeRanges: ESLintAST.Range[] = [
    [prevInfo.prevLast.range![1], nodeStartIndex],
  ];
  const hasLeadingComma =
    prevInfo.leadingComma &&
    prevInfo.prevLast.range![1] <= prevInfo.leadingComma.range[0];

  let withTrailingComma: {
    insertCode: string;
    removeRanges: ESLintAST.Range[];
  };

  const suffixRange: ESLintAST.Range = [nodeStartIndex, endInfo.last.range![1]];
  const suffix = sourceCode.text.slice(...suffixRange);
  if (
    endInfo.trailingComma &&
    endInfo.trailingComma.range[1] <= endInfo.last.range![1]
  ) {
    withTrailingComma = {
      insertCode: `${insertCode}${suffix}`,
      removeRanges: [...removeRanges, suffixRange],
    };
    insertCode += `${sourceCode.text.slice(nodeStartIndex, endInfo.trailingComma.range[0])}${sourceCode.text.slice(endInfo.trailingComma.range[1], endInfo.last.range![1])}`;

    if (!hasLeadingComma) {
      if (endInfo.trailingComma) {
        removeRanges.push(endInfo.trailingComma.range);
      }
    }
    removeRanges.push(
      [nodeStartIndex, endInfo.trailingComma.range[0]],
      [endInfo.trailingComma.range[1], endInfo.last.range![1]],
    );
  } else {
    if (!hasLeadingComma) {
      if (endInfo.trailingComma) {
        removeRanges.push(endInfo.trailingComma.range);
      }
    }
    withTrailingComma = {
      insertCode: `${insertCode},${suffix}`,
      removeRanges: [...removeRanges, suffixRange],
    };
    insertCode += suffix;
    removeRanges.push(suffixRange);
  }

  return {
    insertCode,
    removeRanges,
    hasLeadingComma: Boolean(hasLeadingComma),
    withTrailingComma,
  };
}

/**
 * Calculate the fix information of the target element to be moved up for sorting.
 */
function calcTargetMoveUpInfo(
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
  if (
    prevInfo.leadingComma &&
    prevInfo.prevLast.range![1] <= prevInfo.leadingComma.range[0]
  ) {
    insertCode = `${sourceCode.text.slice(
      prevInfo.prevLast.range![1],
      prevInfo.leadingComma.range[0],
    )}${sourceCode.text.slice(prevInfo.leadingComma.range[1], nodeEndIndex)}`;
    removeRanges.push(
      [prevInfo.prevLast.range![1], prevInfo.leadingComma.range[0]],
      [prevInfo.leadingComma.range[1], nodeEndIndex],
    );
  } else {
    insertCode = sourceCode.text.slice(
      prevInfo.prevLast.range![1],
      nodeEndIndex,
    );
    removeRanges.push([prevInfo.prevLast.range![1], nodeEndIndex]);
  }

  const hasTrailingComma =
    endInfo.trailingComma &&
    endInfo.trailingComma.range[1] <= endInfo.last.range![1];
  if (!hasTrailingComma) {
    insertCode += ",";
    if (prevInfo.leadingComma) {
      removeRanges.push(prevInfo.leadingComma.range);
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
  trailingComma: ESLintAST.Token | null;
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
      trailingComma: null,
      nextElement: null,
      last: getLastTokenWithTrailingComments(sourceCode, target),
    };
  }
  const comma = afterToken;
  const nextElement = sourceCode.getTokenAfter(afterToken)!;
  if (isCommaToken(nextElement)) {
    // If the next element is empty,
    // the position of the comma is the end of the element's range.
    return {
      trailingComma: comma,
      nextElement: null,
      last: comma,
    };
  }
  if (isClosingBraceToken(nextElement) || isClosingBracketToken(nextElement)) {
    // If the next token is a closing brace or bracket,
    // the position of the comma is the end of the element's range.
    return {
      trailingComma: comma,
      nextElement: null,
      last: getLastTokenWithTrailingComments(sourceCode, target),
    };
  }

  const node = target.node;

  if (node && node.loc.end.line === nextElement.loc.start.line) {
    // There is no line break between the target element and the next element.
    return {
      trailingComma: comma,
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
      trailingComma: comma,
      nextElement,
      last: comma,
    };
  }

  return {
    trailingComma: comma,
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
    (isCommentToken(after) || isCommaToken(after)) &&
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
  // Previous element token
  prevElement: ESLintAST.Token | null;
  // Leading comma
  leadingComma: ESLintAST.Token | null;
  // The last token of the previous element
  prevLast: ESLintAST.Token | ESTree.Comment;
} {
  const beforeToken = target.node
    ? sourceCode.getTokenBefore(getFirstTokenOfNode(sourceCode, target.node))!
    : target.before;
  if (isNotCommaToken(beforeToken)) {
    // If there is no comma, the element is the first element.
    return {
      prevElement: null,
      leadingComma: null,
      prevLast: beforeToken,
    };
  }
  const comma = beforeToken;
  const prevElement = sourceCode.getTokenBefore(beforeToken)!;

  if (isCommaToken(prevElement)) {
    // If the previous element is empty,
    // the position of the comma is the end of the previous element's range.
    return {
      prevElement: null,
      leadingComma: comma,
      prevLast: comma,
    };
  }

  const endInfo = getElementEndInfo(sourceCode, { node: prevElement });

  return {
    prevElement,
    leadingComma: endInfo.trailingComma,
    prevLast: endInfo.last,
  };
}
