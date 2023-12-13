import type { Comment } from "estree";
import type { AST, SourceCode } from "eslint";

type IsToken = (token: AST.Token | Comment) => token is AST.Token;
type IsNotToken = (token: AST.Token | Comment) => boolean;

declare module "@eslint-community/eslint-utils" {
  export const findVariable: unknown;
  export const getFunctionHeadLocation: IsToken;
  export const getFunctionNameWithKind: IsToken;
  export const getInnermostScope: IsToken;
  export const getPropertyName: IsToken;
  export const getStaticValue: IsToken;
  export const getStringIfConstant: IsToken;
  export const hasSideEffect: IsToken;
  export const isArrowToken: IsToken;
  export const isClosingBraceToken: IsToken;
  export const isClosingBracketToken: IsToken;
  export const isClosingParenToken: IsToken;
  export const isColonToken: IsToken;
  export const isCommaToken: IsToken;
  export const isCommentToken: (token: AST.Token | Comment) => token is Comment;
  export const isNotArrowToken: IsNotToken;
  export const isNotClosingBraceToken: IsNotToken;
  export const isNotClosingBracketToken: IsNotToken;
  export const isNotClosingParenToken: IsNotToken;
  export const isNotColonToken: IsNotToken;
  export const isNotCommaToken: IsNotToken;
  export const isNotCommentToken: IsNotToken;
  export const isNotOpeningBraceToken: IsNotToken;
  export const isNotOpeningBracketToken: IsNotToken;
  export const isNotOpeningParenToken: IsNotToken;
  export const isNotSemicolonToken: IsNotToken;
  export const isOpeningBraceToken: IsToken;
  export const isOpeningBracketToken: IsToken;
  export const isOpeningParenToken: IsToken;
  export function isParenthesized(node: any, sourceCode: SourceCode): boolean;
  export function isParenthesized(
    times: number,
    node: any,
    sourceCode: SourceCode,
  ): boolean;
  export const isSemicolonToken: IsToken;
  export const ReferenceTracker: {
    READ: never;
    CALL: never;
    CONSTRUCT: never;
    new (): never;
  };
  export class PatternMatcher {
    public constructor(pattern: RegExp, options?: { escaped?: boolean });

    public execAll(str: string): IterableIterator<RegExpExecArray>;

    public test(str: string): boolean;

    public [Symbol.replace](
      str: string,
      replacer: string | ((...ss: string[]) => string),
    ): string;
  }
}
