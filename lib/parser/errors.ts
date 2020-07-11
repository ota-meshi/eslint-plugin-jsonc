import type { Position, BaseNode, Node, RegExpLiteral } from "estree"
import type { AST } from "eslint"
import { getFixLocation } from "./convert"
/**
 * JSON parse errors.
 */
export class ParseError extends SyntaxError {
    public index: number
    public lineNumber: number
    public column: number

    /**
     * Normalize the error object.
     * @param x The error object to normalize.
     */
    public static normalize(x: any): ParseError | null {
        if (ParseError.isParseError(x)) {
            return x
        }
        if (isAcornStyleParseError(x)) {
            return new ParseError(x.message, x.pos, x.loc.line, x.loc.column)
        }
        return null
    }

    /**
     * Initialize this ParseError instance.
     * @param message The error message.
     * @param code The error code. See also: https://html.spec.whatwg.org/multipage/parsing.html#parse-errors
     * @param offset The offset number of this error.
     * @param line The line number of this error.
     * @param column The column number of this error.
     */
    public constructor(
        message: string,
        offset: number,
        line: number,
        column: number,
    ) {
        super(message)
        this.index = offset
        this.lineNumber = line
        this.column = column
    }

    /**
     * Type guard for ParseError.
     * @param x The value to check.
     * @returns `true` if the value has `message`, `pos`, `loc` properties.
     */
    public static isParseError(x: any): x is ParseError {
        return (
            x instanceof ParseError ||
            (typeof x.message === "string" &&
                typeof x.index === "number" &&
                typeof x.lineNumber === "number" &&
                typeof x.column === "number")
        )
    }
}

/**
 * Throw syntax error for empty.
 */
export function throwEmptyError(expected: string): never {
    const err = new ParseError(
        `Expected to be ${expected}, but got empty.`,
        0,
        1,
        1,
    )

    throw err
}

/**
 * Throw syntax error for expected token.
 * @param name The token name.
 * @param token The token object to get that location.
 */
export function throwExpectedTokenError(
    name: string,
    token: BaseNode,
    after?: boolean,
): never {
    const locs = getFixLocation(token)
    const err = new ParseError(
        `Expected token '${name}'.`,
        after ? locs.range[1] : locs.range[0],
        after ? locs.loc.end.line : locs.loc.start.line,
        (after ? locs.loc.end.column : locs.loc.start.column) + 1,
    )

    throw err
}

/**
 * Throw syntax error for unexpected token.
 * @param name The token name.
 * @param token The token object to get that location.
 */
export function throwUnexpectedTokenError(
    name: string,
    token: BaseNode,
): never {
    const locs = getFixLocation(token)
    const err = new ParseError(
        `Unexpected token '${name}'.`,
        locs.range[0],
        locs.loc.start.line,
        locs.loc.start.column + 1,
    )

    throw err
}

/**
 * Throw syntax error for unexpected token.
 * @param node The token object to get that location.
 */
export function throwUnexpectedNodeError(
    node: Node,
    tokens: AST.Token[],
    offset?: number,
): never {
    if (node.type === "Identifier") {
        const locs = getFixLocation(node)
        const err = new ParseError(
            `Unexpected identifier '${node.name}'.`,
            locs.range[0],
            locs.loc.start.line,
            locs.loc.start.column + 1,
        )
        throw err
    }
    if (node.type === "Literal") {
        const type = (node as any).bigint
            ? "bigint"
            : (node as RegExpLiteral).regex
            ? "regex"
            : node.value === null
            ? "null"
            : typeof node.value
        const locs = getFixLocation(node)
        const err = new ParseError(
            `Unexpected ${type} literal.`,
            locs.range[0],
            locs.loc.start.line,
            locs.loc.start.column + 1,
        )
        throw err
    }
    if (
        node.type.endsWith("Expression") &&
        node.type !== "FunctionExpression"
    ) {
        const name = node.type.replace(/\B([A-Z])/gu, " $1").toLowerCase()
        const locs = getFixLocation(node)
        const err = new ParseError(
            `Unexpected ${name}.`,
            locs.range[0],
            locs.loc.start.line,
            locs.loc.start.column + 1,
        )
        throw err
    }
    const index = node.range![0] + (offset || 0)
    const t = tokens.find(
        (token) => token.range[0] <= index && index < token.range[1],
    )
    const name = t?.value || "unknown"
    const locs = getFixLocation(t || node)
    const err = new ParseError(
        `Unexpected token '${name}'.`,
        locs.range[0],
        locs.loc.start.line,
        locs.loc.start.column + 1,
    )

    throw err
}

/**
 * Throw syntax error for unexpected comma token.
 */
export function throwUnexpectedCommaTokenError(
    offset: number,
    tokens: AST.Token[],
    after?: boolean,
) {
    return throwUnexpectedTokenError(
        ",",
        (after
            ? getCommaTokenAfterNode(tokens, offset)
            : getCommaTokenBeforeNode(tokens, offset)) || {
            type: "",
            loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 0 } },
            range: [0, 0],
        },
    )
}

/**
 * Throw syntax error of outside of code.
 */
export function throwErrorAsAdjustingOutsideOfCode(
    err: any,
    code: string,
): never {
    if (ParseError.isParseError(err)) {
        const endOffset = code.length
        if (err.index >= endOffset) {
            err.message = "Unexpected end of expression."
        }
    }

    throw err
}

/**
 * Check whether the given value has acorn style location information.
 * @param x The value to check.
 * @returns `true` if the value has acorn style location information.
 */
function isAcornStyleParseError(
    x: any,
): x is { message: string; pos: number; loc: Position } {
    return (
        typeof x.message === "string" &&
        typeof x.pos === "number" &&
        typeof x.loc === "object" &&
        x.loc !== null &&
        typeof x.loc.line === "number" &&
        typeof x.loc.column === "number"
    )
}

/**
 * Get the comma token before a given node.
 * @param tokens The token list.
 * @param offset The offset to get the comma after this offset.
 * @returns The comma token.
 */
function getCommaTokenBeforeNode(
    tokens: AST.Token[],
    offset: number,
): AST.Token | null {
    let tokenIndex = tokens.findIndex(
        (token) => token.range[0] <= offset && offset < token.range[1],
    )

    while (tokenIndex >= 0) {
        const token = tokens[tokenIndex]
        if (token.type === "Punctuator" && token.value === ",") {
            return token
        }
        tokenIndex -= 1
    }

    return null
}

/**
 * Get the comma token after a given node.
 * @param tokens The token list.
 * @param offset The offset to get the comma after this offset.
 * @returns The comma token.
 */
function getCommaTokenAfterNode(
    tokens: AST.Token[],
    offset: number,
): AST.Token | null {
    let tokenIndex = tokens.findIndex(
        (token) => token.range[0] <= offset && offset < token.range[1],
    )

    while (tokenIndex < tokens.length) {
        const token = tokens[tokenIndex]
        if (token.type === "Punctuator" && token.value === ",") {
            return token
        }
        tokenIndex += 1
    }

    return null
}
