import type { ExpressionStatement, CallExpression } from "estree"
import type { Linter, AST } from "eslint"
import path from "path"
import stripJsonComments from "strip-json-comments"
import { getEspree } from "./espree"
import {
    ParseError,
    throwEmptyError,
    throwUnexpectedTokenError,
    throwErrorAsAdjustingOutsideOfCode,
    throwUnexpectedCommaTokenError,
} from "./errors"
import { KEYS } from "./visitor-keys"
import {
    convertNode,
    convertToken,
    fixLocation,
    fixErrorLocation,
} from "./convert"
import { JSONProgram } from "./ast"

const KNOWN_JSON_EXT = new Set<string>([".json", ".json5"])
const KNOWN_NON_JSON_EXT = new Set<string>([
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".html",
    ".css",
    ".scss",
    ".less",
    ".vue",
])

/**
 * Parse source code
 */
export function parseForESLint(
    code: string,
    options?: any,
): Linter.ESLintParseResult {
    if (!isJSONFile(code, options)) {
        const ast = parseJS(code, options)
        return { ast }
    }

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
            return throwUnexpectedCommaTokenError(node.range![0], tokens)
        }

        // Remove parens.
        tokens.shift()
        tokens.shift()
        tokens.pop()
        const last = tokens[tokens.length - 1]

        if (last && last.type === "Punctuator" && last.value === ",") {
            return throwUnexpectedTokenError(",", last)
        }

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
 * Check whether the code is a JSON.
 * @param code The source code to check.
 * @param options The parser options.
 * @returns `true` if the source code is a JSON.
 */
function isJSONFile(code: string, options: any): boolean {
    const filePath = options.filePath as string | undefined
    if (filePath) {
        const ext = path.extname(filePath.toLowerCase())
        if (KNOWN_JSON_EXT.has(ext)) {
            return true
        }
        if (KNOWN_NON_JSON_EXT.has(ext)) {
            return false
        }
    }
    const jsonCode = stripJsonComments(code).trim()

    const firstChar = jsonCode[0]
    const lastChar = jsonCode[jsonCode.length - 1]
    if (firstChar === "{") {
        return lastChar === "}"
    }
    if (firstChar === "[") {
        return lastChar === "]"
    }
    if (firstChar === "t") {
        return jsonCode === "true"
    }
    if (firstChar === "f") {
        return jsonCode === "false"
    }
    if (firstChar === "n") {
        return jsonCode === "null"
    }
    if ("-0123456789".includes(firstChar)) {
        return Number.isFinite(Number(jsonCode))
    }
    if (firstChar === '"') {
        if (lastChar !== '"') {
            return false
        }
        try {
            JSON.parse(jsonCode)
            return true
        } catch {
            return false
        }
    }
    return false
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
 * 1. Set `node.parent`.
 * 2. Fix `node.range` and `node.loc` for HTML entities.
 *
 * @param result The parsing result to modify.
 */
function postprocess(ast: AST.Program) {
    const originalTokens = ast.tokens
    const comments = ast.comments
    const jsonAst = convertNode(ast, originalTokens) as JSONProgram

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
