import type { ExpressionStatement, CallExpression } from "estree"
import type { Linter, AST } from "eslint"
import { getEspree } from "./espree"
import {
    ParseError,
    throwEmptyError,
    throwUnexpectedTokenError,
    throwErrorAsAdjustingOutsideOfCode,
} from "./errors"
import { KEYS } from "./visitor-keys"
import {
    convertNode,
    convertToken,
    fixLocation,
    fixErrorLocation,
    getTokenBeforeNode,
} from "./convert"

/**
 * Parse source code
 */
export function parseForESLint(
    code: string,
    options?: any,
): Linter.ESLintParseResult {
    try {
        const ast = parseJS(`0(${code}\n)`, options)

        const tokens = ast.tokens || []
        const statement = ast.body[0] as ExpressionStatement
        const callExpression = statement.expression as CallExpression
        const expression = callExpression.arguments[0]

        if (!expression) {
            return throwEmptyError("an expression")
        }
        if (expression && expression.type === "SpreadElement") {
            return throwUnexpectedTokenError("...", expression)
        }
        if (callExpression.arguments[1]) {
            const node = callExpression.arguments[1]
            return throwUnexpectedTokenError(
                ",",
                getTokenBeforeNode(tokens, node.range![0], {
                    type: "Punctuator",
                    value: ",",
                }),
            )
        }

        // Remove parens.
        tokens.shift()
        tokens.shift()
        tokens.pop()
        const last = tokens[tokens.length - 1]

        if (last && last.type === "Punctuator" && last.value === ",") {
            return throwUnexpectedTokenError(",", last)
        }

        ast.range[1] = statement.range![1] = last.range[1]
        ast.loc.end.line = statement.loc!.end.line = last.loc.end.line
        ast.loc.end.column = statement.loc!.end.column = last.loc.end.column
        ast.body = [statement]
        statement.expression = expression

        return {
            ast: postprocess(ast) as never,
            visitorKeys: KEYS,
            // @ts-expect-error
            services: {
                isJSON: true,
            },
        }
    } catch (err) {
        return throwErrorAsAdjustingOutsideOfCode(err, code)
    }
}

/**
 * Parse the given source code.
 *
 * @param code The source code to parse.
 * @param options The parser options.
 * @returns The result of parsing.
 */
function parseJS(code: string, options: any): AST.Program {
    const espree = getEspree()
    try {
        return espree.parse(code, options)
    } catch (err) {
        const perr = ParseError.normalize(err)
        if (perr) {
            fixErrorLocation(perr)
            throw perr
        }
        throw err
    }
}

/**
 * Do post-process of parsing an expression.
 *
 * 1. Convert node type.
 * 2. Fix `node.range` and `node.loc` for JSON entities.
 *
 * @param result The parsing result to modify.
 */
function postprocess(ast: AST.Program) {
    const originalTokens = ast.tokens
    const comments = ast.comments
    const jsonAst = convertNode(ast, originalTokens)

    const tokens = []
    for (const token of originalTokens || []) {
        tokens.push(convertToken(token))
    }
    for (const comment of comments || []) {
        fixLocation(comment)
    }
    jsonAst.tokens = tokens
    jsonAst.comments = comments
    return jsonAst
}
