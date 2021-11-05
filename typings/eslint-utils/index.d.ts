// eslint-disable-next-line eslint-comments/disable-enable-pair -- ignore
/* eslint-disable one-var, @typescript-eslint/naming-convention -- ignore */
import type { Comment } from "estree"
import type { AST, SourceCode } from "eslint"

declare module "eslint-utils" {
    export const findVariable: unknown
    export const getFunctionHeadLocation: unknown
    export const getFunctionNameWithKind: unknown
    export const getInnermostScope: unknown
    export const getPropertyName: unknown
    export const getStaticValue: unknown
    export const getStringIfConstant: unknown
    export const hasSideEffect: unknown
    export const isArrowToken: unknown
    export const isClosingBraceToken: unknown
    export const isClosingBracketToken: unknown
    export const isClosingParenToken: unknown
    export const isColonToken: unknown
    export const isCommaToken: (
        token: AST.Token | Comment,
    ) => token is AST.Token & { type: "Punctuator"; value: "," }
    export const isCommentToken: unknown
    export const isNotArrowToken: unknown
    export const isNotClosingBraceToken: unknown
    export const isNotClosingBracketToken: unknown
    export const isNotClosingParenToken: unknown
    export const isNotColonToken: unknown
    export const isNotCommaToken: unknown
    export const isNotCommentToken: unknown
    export const isNotOpeningBraceToken: unknown
    export const isNotOpeningBracketToken: unknown
    export const isNotOpeningParenToken: unknown
    export const isNotSemicolonToken: unknown
    export const isOpeningBraceToken: unknown
    export const isOpeningBracketToken: unknown
    export const isOpeningParenToken: unknown
    export function isParenthesized(node: any, sourceCode: SourceCode): boolean
    export function isParenthesized(
        times: number,
        node: any,
        sourceCode: SourceCode,
    ): boolean
    export const isSemicolonToken: unknown
    export const ReferenceTracker: {
        READ: never
        CALL: never
        CONSTRUCT: never
        new (): never
    }
    export class PatternMatcher {
        public constructor(pattern: RegExp, options?: { escaped?: boolean })

        public execAll(str: string): IterableIterator<RegExpExecArray>

        public test(str: string): boolean

        public [Symbol.replace](
            str: string,
            replacer: string | ((...ss: string[]) => string),
        ): string
    }
}
