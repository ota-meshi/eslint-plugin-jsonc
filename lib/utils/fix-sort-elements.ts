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

  const toBeforeToken = to.node
    ? sourceCode.getTokenBefore(getFirstTokenOfNode(sourceCode, to.node))!
    : to.before;
  let insertRange = toBeforeToken.range;
  const toBeforeNextToken = sourceCode.getTokenAfter(toBeforeToken, {
    includeComments: true,
  })!;
  if (toBeforeNextToken.loc!.start.line - toBeforeToken.loc.end.line > 1) {
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
 * Calculate the range of the target information.
 */
function calcTargetInfo(
  sourceCode: SourceCode,
  target: Target,
): {
  insertCode: string;
  removeRanges: ESLintAST.Range[];
} {
  if (!target.node) {
    return calcTargetInfoFromAround(sourceCode, target);
  }
  const node = target.node;
  const nodeLastToken = getLastTokenOfNode(sourceCode, node);

  const endInfo = getElementEndInfo(sourceCode, node);
  const prevInfo = getPrevElementInfo(sourceCode, node);

  let insertCode: string;

  const removeRanges: ESLintAST.Range[] = [];
  if (prevInfo.comma && prevInfo.end <= prevInfo.comma.range[0]) {
    insertCode = `${sourceCode.text.slice(
      prevInfo.end,
      prevInfo.comma.range[0],
    )}${sourceCode.text.slice(prevInfo.comma.range[1], nodeLastToken.range[1])}`;
    removeRanges.push(
      [prevInfo.end, prevInfo.comma.range[0]],
      [prevInfo.comma.range[1], nodeLastToken.range[1]],
    );
  } else {
    insertCode = sourceCode.text.slice(prevInfo.end, nodeLastToken.range[1]);
    removeRanges.push([prevInfo.end, nodeLastToken.range[1]]);
  }

  const hasTrailingComma =
    endInfo.comma && endInfo.comma.range[1] <= endInfo.end;
  if (!hasTrailingComma) {
    insertCode += ",";
    if (prevInfo.comma) {
      removeRanges.push(prevInfo.comma.range);
    }
  }
  insertCode += sourceCode.text.slice(nodeLastToken.range[1], endInfo.end);
  removeRanges.push([nodeLastToken.range[1], endInfo.end]);

  return {
    insertCode,
    removeRanges,
  };
}

/**
 * Calculate the range of the target information from the around tokens.
 */
function calcTargetInfoFromAround(
  sourceCode: SourceCode,
  target: AroundTarget,
): {
  insertCode: string;
  removeRanges: ESLintAST.Range[];
} {
  const hasTrailingComma = isComma(target.after);
  const codeStart = target.before.range[1]; // to include comments
  let codeEnd: number;
  if (hasTrailingComma) {
    // , /**/,
    //  ^^^^^^
    codeEnd = target.after.range[1];
  } else {
    // , /**/ ]
    //  ^^^^^^
    codeEnd = target.after.range[0];
  }
  let removeStart = codeStart;
  if (!hasTrailingComma) {
    // The target is always the second or subsequent element, so it always has a leading comma.
    // , /**/ ]
    // ^^^^^^^
    removeStart = target.before.range[0];
  }

  return {
    insertCode:
      sourceCode.text.slice(codeStart, codeEnd) + (hasTrailingComma ? "" : ","),
    removeRanges: [[removeStart, codeEnd]],
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
    (target = sourceCode.getTokenBefore(target)) &&
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
    (target = sourceCode.getTokenAfter(target)) &&
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
  node: AST.JSONNode | ESLintAST.Token,
): {
  // Trailing comma
  comma: ESLintAST.Token | null;
  // Next element token
  nextElement: ESLintAST.Token | null;
  // The end of the range of the target element
  end: number;
} {
  const lastToken = getLastTokenOfNode(sourceCode, node);
  const afterToken = sourceCode.getTokenAfter(lastToken)!;
  if (isNotCommaToken(afterToken)) {
    // If there is no comma, the element is the last element.
    return {
      comma: null,
      nextElement: null,
      end: calcEndWithTrailingComments(),
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
      end: comma.range[1],
    };
  }
  if (isClosingBrace(nextElement) || isClosingBracket(nextElement)) {
    // If the next token is a closing brace or bracket,
    // the position of the comma is the end of the element's range.
    return {
      comma,
      nextElement: null,
      end: calcEndWithTrailingComments(),
    };
  }

  if (node.loc.end.line === nextElement.loc.start.line) {
    // There is no line break between the target element and the next element.
    return {
      comma,
      nextElement,
      end: comma.range[1],
    };
  }
  // There are line breaks between the target element and the next element.
  if (
    node.loc.end.line < comma.loc.start.line &&
    comma.loc.end.line < nextElement.loc.start.line
  ) {
    // If there is a line break between the target element and a comma and the next element,
    // the position of the comma is the end of the element's range.
    return {
      comma,
      nextElement,
      end: comma.range[1],
    };
  }

  return {
    comma,
    nextElement,
    end: calcEndWithTrailingComments(),
  };

  /**
   * Calculate the end of the target element with trailing comments.
   */
  function calcEndWithTrailingComments() {
    let end = lastToken.range[1];
    let after = sourceCode.getTokenAfter(lastToken, {
      includeComments: true,
    })!;
    while (
      (isCommentToken(after) || isComma(after)) &&
      node.loc.end.line === after.loc!.end.line
    ) {
      end = after.range![1];
      after = sourceCode.getTokenAfter(after, {
        includeComments: true,
      })!;
    }
    return end;
  }
}

/**
 * Get the previous element and token information.
 */
function getPrevElementInfo(
  sourceCode: SourceCode,
  node: AST.JSONNode,
): {
  // Leading comma
  comma: ESLintAST.Token | null;
  // Previous element token
  prevElement: ESLintAST.Token | null;
  // The end of the range of the target element
  end: number;
} {
  const firstToken = getFirstTokenOfNode(sourceCode, node);
  const beforeToken = sourceCode.getTokenBefore(firstToken)!;
  if (isNotCommaToken(beforeToken)) {
    // If there is no comma, the element is the first element.
    return {
      comma: null,
      prevElement: null,
      end: beforeToken.range[1],
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
      end: comma.range[1],
    };
  }

  const endInfo = getElementEndInfo(sourceCode, prevElement);

  return {
    comma: endInfo.comma,
    prevElement,
    end: endInfo.end,
  };
}
