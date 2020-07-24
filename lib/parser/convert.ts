import type {
    Node,
    BaseNode,
    RegExpLiteral,
    Program,
    ObjectExpression,
    Property,
    ArrayExpression,
    Literal,
    Identifier,
    UnaryExpression,
    TemplateLiteral,
    TemplateElement,
    Expression,
} from "estree"
import type { AST } from "eslint"
import {
    JSONNode,
    JSONProgram,
    JSONExpressionStatement,
    JSONObjectExpression,
    JSONProperty,
    JSONArrayExpression,
    JSONExpression,
    JSONLiteral,
    JSONIdentifier,
    Locations,
    JSONUnaryExpression,
    JSONNumberIdentifier,
    JSONNumberLiteral,
    JSONTemplateLiteral,
    JSONTemplateElement,
    JSONRegExpLiteral,
    JSONBigIntLiteral,
    JSONKeywordLiteral,
    JSONStringLiteral,
} from "./ast"
import { getKeys, getNodes } from "./traverse"
import {
    ParseError,
    throwUnexpectedNodeError,
    throwExpectedTokenError,
    throwUnexpectedTokenError,
} from "./errors"

export function convertNode(node: Program, tokens: AST.Token[]): JSONProgram
export function convertNode(
    node: ObjectExpression,
    tokens: AST.Token[],
): JSONObjectExpression
export function convertNode(
    node: ArrayExpression,
    tokens: AST.Token[],
): JSONArrayExpression
export function convertNode(node: Literal, tokens: AST.Token[]): JSONLiteral
export function convertNode(
    node: UnaryExpression,
    tokens: AST.Token[],
): JSONUnaryExpression
export function convertNode(
    node: Identifier,
    tokens: AST.Token[],
): JSONIdentifier
export function convertNode(
    node: TemplateLiteral,
    tokens: AST.Token[],
): JSONTemplateLiteral
export function convertNode(
    node: Expression,
    tokens: AST.Token[],
): JSONExpression
export function convertNode(node: Node, tokens: AST.Token[]): JSONNode
/**
 * Convert ES node to JSON node
 */
export function convertNode(node: Node, tokens: AST.Token[]): JSONNode {
    if (node.type === "Program") {
        return convertProgramNode(node, tokens)
    }
    if (node.type === "ObjectExpression") {
        return convertObjectExpressionNode(node, tokens)
    }
    if (node.type === "ArrayExpression") {
        return convertArrayExpressionNode(node, tokens)
    }
    if (node.type === "Literal") {
        return convertLiteralNode(node, tokens)
    }
    if (node.type === "UnaryExpression") {
        return convertUnaryExpressionNode(node, tokens)
    }
    if (node.type === "Identifier") {
        return convertIdentifierNode(node, tokens)
    }
    if (node.type === "TemplateLiteral") {
        return convertTemplateLiteralNode(node, tokens)
    }
    return throwUnexpectedNodeError(node, tokens)
}

/**
 * Convert ES token to JSON token
 */
export function convertToken(token: AST.Token): AST.Token {
    if (token.type === "Punctuator") {
        if (token.value === "(" || token.value === ")") {
            return throwUnexpectedTokenError(token.value, token)
        }
    }
    return {
        type: token.type,
        value: token.value,
        ...getFixLocation(token),
    }
}

/**
 * Convert Program node to JSONProgram node
 */
function convertProgramNode(node: Program, tokens: AST.Token[]): JSONProgram {
    /* istanbul ignore next */
    if (node.type !== "Program") {
        return throwUnexpectedNodeError(node, tokens)
    }
    const bodyNode = node.body[0]
    if (bodyNode.type !== "ExpressionStatement") {
        return throwUnexpectedNodeError(bodyNode, tokens)
    }
    const expression = bodyNode.expression
    if (expression.type === "Identifier") {
        if (!isStaticValueIdentifier(expression)) {
            return throwUnexpectedNodeError(expression, tokens)
        }
    }
    const body: JSONExpressionStatement = {
        type: "JSONExpressionStatement",
        expression: convertNode(expression, tokens),
        ...getFixLocation(bodyNode),
        parent: null as never,
    }

    const nn: JSONProgram = {
        type: "Program",
        body: [body],
        comments: [],
        tokens: [],
        ...getFixLocation(node),
        parent: null as never,
    }
    return nn
}

/**
 * Convert ObjectExpression node to JSONObjectExpression node
 */
function convertObjectExpressionNode(
    node: ObjectExpression,
    tokens: AST.Token[],
): JSONObjectExpression {
    /* istanbul ignore next */
    if (node.type !== "ObjectExpression") {
        return throwUnexpectedNodeError(node, tokens)
    }

    const nn: JSONObjectExpression = {
        type: "JSONObjectExpression",
        properties: node.properties.map((p) =>
            convertPropertyNode(p as Property, tokens),
        ),
        ...getFixLocation(node),
        parent: null as never,
    }
    checkUnexpectedKeys(node, tokens, nn)
    return nn
}

/**
 * Convert Property node to JSONProperty node
 */
function convertPropertyNode(
    node: Property,
    tokens: AST.Token[],
): JSONProperty {
    if (node.type !== "Property") {
        return throwUnexpectedNodeError(node, tokens)
    }

    if (node.computed) {
        return throwUnexpectedNodeError(node, tokens)
    }
    if (node.method) {
        return throwUnexpectedNodeError(node.value, tokens)
    }
    if (node.shorthand) {
        return throwExpectedTokenError(":", node, true)
    }
    if (node.kind !== "init") {
        return throwExpectedTokenError(":", node.key)
    }
    if (node.key.type === "Literal") {
        const keyValueType = typeof node.key.value
        if (keyValueType !== "string" && keyValueType !== "number") {
            return throwUnexpectedNodeError(node.key, tokens)
        }
    } else if (node.key.type !== "Identifier") {
        return throwUnexpectedNodeError(node.key, tokens)
    }
    if (node.value.type === "Identifier") {
        if (!isStaticValueIdentifier(node.value)) {
            return throwUnexpectedNodeError(node.value, tokens)
        }
    }
    const nn: JSONProperty = {
        type: "JSONProperty",
        key: convertNode(node.key, tokens) as
            | JSONStringLiteral
            | JSONNumberLiteral
            | JSONIdentifier,
        value: convertNode(node.value, tokens) as JSONExpression,
        kind: node.kind,
        computed: node.computed,
        method: node.method,
        shorthand: node.shorthand,
        ...getFixLocation(node),
        parent: null as never,
    }
    checkUnexpectedKeys(node, tokens, nn)
    return nn
}

/**
 * Convert ArrayExpression node to JSONArrayExpression node
 */
function convertArrayExpressionNode(
    node: ArrayExpression,
    tokens: AST.Token[],
): JSONArrayExpression {
    /* istanbul ignore next */
    if (node.type !== "ArrayExpression") {
        return throwUnexpectedNodeError(node, tokens)
    }
    const elements = node.elements.map((child) => {
        if (!child) {
            return null
        }
        if (child.type === "Identifier") {
            if (!isStaticValueIdentifier(child)) {
                return throwUnexpectedNodeError(child, tokens)
            }
        }
        return convertNode(child, tokens) as JSONExpression
    })
    const nn: JSONArrayExpression = {
        type: "JSONArrayExpression",
        elements,
        ...getFixLocation(node),
        parent: null as never,
    }
    checkUnexpectedKeys(node, tokens, nn)
    return nn
}

/**
 * Check if the given node is RegExpLiteral
 */
function isRegExpLiteral(node: Literal): node is RegExpLiteral {
    return Boolean((node as RegExpLiteral).regex)
}

/**
 * Convert Literal node to JSONLiteral node
 */
function convertLiteralNode(node: Literal, tokens: AST.Token[]): JSONLiteral {
    /* istanbul ignore next */
    if (node.type !== "Literal") {
        return throwUnexpectedNodeError(node, tokens)
    }

    let nn: JSONLiteral
    if (isRegExpLiteral(node)) {
        nn = {
            type: "JSONLiteral",
            value: node.value,
            raw: node.raw!,
            regex: node.regex,
            ...getFixLocation(node),
        } as JSONRegExpLiteral
    } else if ((node as any).bigint) {
        nn = {
            type: "JSONLiteral",
            value: node.value,
            raw: node.raw!,
            bigint: (node as any).bigint,
            ...getFixLocation(node),
        } as JSONBigIntLiteral
    } else {
        const value = node.value
        nn = {
            type: "JSONLiteral",
            value,
            raw: node.raw!,
            ...getFixLocation(node),
        } as JSONStringLiteral | JSONNumberLiteral | JSONKeywordLiteral
    }
    checkUnexpectedKeys(node, tokens, nn)
    return nn
}

/**
 * Convert UnaryExpression node to JSONUnaryExpression node
 */
function convertUnaryExpressionNode(
    node: UnaryExpression,
    tokens: AST.Token[],
): JSONUnaryExpression {
    /* istanbul ignore next */
    if (node.type !== "UnaryExpression") {
        return throwUnexpectedNodeError(node, tokens)
    }
    const operator = node.operator

    if (operator !== "-" && operator !== "+") {
        return throwUnexpectedNodeError(node, tokens)
    }
    const argument = node.argument
    if (argument.type === "Literal") {
        if (typeof argument.value !== "number") {
            return throwUnexpectedNodeError(argument, tokens)
        }
    } else if (argument.type === "Identifier") {
        if (!isNumberIdentifier(argument)) {
            return throwUnexpectedNodeError(argument, tokens)
        }
    } else {
        return throwUnexpectedNodeError(argument, tokens)
    }

    const nn: JSONUnaryExpression = {
        type: "JSONUnaryExpression",
        operator,
        prefix: node.prefix,
        argument: convertNode(argument, tokens) as
            | JSONNumberLiteral
            | JSONNumberIdentifier,
        ...getFixLocation(node),
        parent: null as never,
    }
    checkUnexpectedKeys(node, tokens, nn)
    return nn
}

/**
 * Convert Identifier node to JSONIdentifier node
 */
function convertIdentifierNode(
    node: Identifier,
    tokens: AST.Token[],
): JSONIdentifier {
    /* istanbul ignore next */
    if (node.type !== "Identifier") {
        return throwUnexpectedNodeError(node, tokens)
    }
    const nn: JSONIdentifier = {
        type: "JSONIdentifier",
        name: node.name,
        ...getFixLocation(node),
    }
    checkUnexpectedKeys(node, tokens, nn)
    return nn
}

/**
 * Convert TemplateLiteral node to JSONTemplateLiteral node
 */
function convertTemplateLiteralNode(
    node: TemplateLiteral,
    tokens: AST.Token[],
): JSONTemplateLiteral {
    /* istanbul ignore next */
    if (node.type !== "TemplateLiteral") {
        return throwUnexpectedNodeError(node, tokens)
    }
    if (node.expressions.length) {
        const token = getTokenAfterNode(tokens, node.quasis[0].range![0], {
            type: "Template",
        })
        const loc: BaseNode = {
            type: "Punctuator",
            loc: {
                start: {
                    line: token.loc.end.line,
                    column: token.loc.end.column - 2,
                },
                end: token.loc.end,
            },
            range: [token.range[1] - 2, token.range[1]],
        }
        return throwUnexpectedTokenError("$", loc)
    }

    const quasis: [JSONTemplateElement] = [
        convertTemplateElementNode(node.quasis[0], tokens),
    ]

    const nn: JSONTemplateLiteral = {
        type: "JSONTemplateLiteral",
        quasis,
        expressions: [],
        ...getFixLocation(node),
        parent: null as never,
    }
    checkUnexpectedKeys(node, tokens, nn)
    return nn
}

/**
 * Convert TemplateElement node to JSONTemplateElement node
 */
function convertTemplateElementNode(
    node: TemplateElement,
    tokens: AST.Token[],
): JSONTemplateElement {
    /* istanbul ignore next */
    if (node.type !== "TemplateElement") {
        return throwUnexpectedNodeError(node, tokens)
    }

    const nn: JSONTemplateElement = {
        type: "JSONTemplateElement",
        tail: node.tail,
        value: node.value,
        ...getFixLocation(node),
        parent: null as never,
    }
    checkUnexpectedKeys(node, tokens, nn)
    return nn
}

/**
 * Check if given node is NaN or Infinity or undefined
 */
function isStaticValueIdentifier(
    node: Identifier,
): node is Identifier & { name: "NaN" | "Infinity" | "undefined" } {
    return isNumberIdentifier(node) || node.name === "undefined"
}

/**
 * Check if given node is NaN or Infinity
 */
function isNumberIdentifier(
    node: Identifier,
): node is Identifier & { name: "NaN" | "Infinity" } {
    return node.name === "NaN" || node.name === "Infinity"
}

/**
 * Check unknown keys
 */
function checkUnexpectedKeys(
    node: Node,
    tokens: AST.Token[],
    jsonNode: JSONNode,
) {
    const keys = getKeys(node)
    for (const key of keys) {
        if (!(key in jsonNode)) {
            throwUnexpectedNodeError(
                getNodes(node, key).next().value as Node,
                tokens,
            )
        }
    }
}

/**
 * Fix the location information of the given node.
 * @param node The node.
 */
export function fixLocation(node: BaseNode | AST.Token) {
    const locs = getFixLocation(node)
    node.range = locs.range
    node.loc = locs.loc
}

/**
 * Modify the location information of the given error with using the base offset and gaps of this calculator.
 * @param error The error to modify their location.
 */
export function fixErrorLocation(error: ParseError) {
    error.index = Math.max(error.index - 2, 0)
    if (error.lineNumber === 0) {
        error.column = Math.max(error.column - 2, 0)
    }
}

/**
 * Get the location information of the given node.
 * @param node The node.
 */
export function getFixLocation(node: BaseNode | AST.Token): Locations {
    const range = node.range!
    const loc = node.loc!

    return {
        range: [Math.max(range[0] - 2, 0), Math.max(range[1] - 2, 0)],
        loc: {
            start: {
                line: loc.start.line,
                column:
                    loc.start.line === 1
                        ? Math.max(loc.start.column - 2, 0)
                        : loc.start.column,
            },
            end: {
                line: loc.end.line,
                column:
                    loc.end.line === 1
                        ? Math.max(loc.end.column - 2, 0)
                        : loc.end.column,
            },
        },
    }
}

/**
 * Get the specified token before a given node.
 * @returns The specified token.
 */
export function getTokenBeforeNode(
    tokens: AST.Token[],
    offset: number,
    { type, value }: { type: AST.TokenType | "Template"; value?: string },
): AST.Token {
    const tokenIndex = tokens.findIndex(
        (token) => token.range[0] <= offset && offset < token.range[1],
    )

    for (let index = tokenIndex; index >= 0; index--) {
        const token = tokens[index]
        if (token.type === type && (value == null || token.value === value)) {
            return token
        }
    }
    return tokens[tokenIndex]
}

/**
 * Get the specified token after a given node.
 * @returns The specified token.
 */
export function getTokenAfterNode(
    tokens: AST.Token[],
    offset: number,
    { type, value }: { type: AST.TokenType | "Template"; value?: string },
): AST.Token {
    const tokenIndex = tokens.findIndex(
        (token) => token.range[0] <= offset && offset < token.range[1],
    )
    for (let index = tokenIndex; index < tokens.length; index++) {
        const token = tokens[index]
        if (token.type === type && (value == null || token.value === value)) {
            return token
        }
    }

    return tokens[tokenIndex]
}
