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
} from "./ast"
import { getKeys, getNodes } from "./traverse"
import {
    ParseError,
    throwUnexpectedNodeError,
    throwExpectedTokenError,
    throwUnexpectedCommaTokenError,
    throwUnexpectedTokenError,
} from "./errors"

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
        if (!isNumIdentifier(expression)) {
            return throwUnexpectedNodeError(expression, tokens)
        }
    }
    const body: JSONExpressionStatement = {
        type: "JSONExpressionStatement",
        expression: convertNode(expression, tokens) as JSONExpression,
        ...getFixLocation(bodyNode),
    }

    const nn: JSONProgram = {
        type: "Program",
        body: [body],
        comments: [],
        tokens: [],
        ...getFixLocation(node),
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
    }
    checkUnexpectKeys(node, tokens, nn)
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
        if (typeof node.key.value !== "string") {
            return throwUnexpectedNodeError(node.key, tokens)
        }
    } else if (node.key.type !== "Identifier") {
        return throwUnexpectedNodeError(node.key, tokens)
    }
    if (node.value.type === "Identifier") {
        if (!isNumIdentifier(node.value)) {
            return throwUnexpectedNodeError(node.value, tokens)
        }
    }
    const nn: JSONProperty = {
        type: "JSONProperty",
        key: convertNode(node.key, tokens) as JSONLiteral | JSONIdentifier,
        value: convertNode(node.value, tokens) as JSONExpression,
        kind: "init",
        computed: false,
        method: false,
        shorthand: false,
        ...getFixLocation(node),
    }
    checkUnexpectKeys(node, tokens, nn)
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
    const nn: JSONArrayExpression = {
        type: "JSONArrayExpression",
        elements: node.elements.map((child, index) => {
            if (!child) {
                return throwUnexpectedCommaTokenError(
                    index > 0
                        ? node.elements[index - 1].range![1]
                        : node.range![0],
                    tokens,
                    true,
                )
            }
            if (child.type === "Identifier") {
                if (!isNumIdentifier(child)) {
                    return throwUnexpectedNodeError(child, tokens)
                }
            }
            return convertNode(child, tokens) as JSONExpression
        }),
        ...getFixLocation(node),
    }
    checkUnexpectKeys(node, tokens, nn)
    return nn
}

/**
 * Convert Literal node to JSONLiteral node
 */
function convertLiteralNode(node: Literal, tokens: AST.Token[]): JSONLiteral {
    /* istanbul ignore next */
    if (node.type !== "Literal") {
        return throwUnexpectedNodeError(node, tokens)
    }
    const value = node.value

    if ((node as RegExpLiteral).regex) {
        return throwUnexpectedNodeError(node, tokens)
    }
    if ((node as any).bigint) {
        return throwUnexpectedNodeError(node, tokens)
    }
    if (value !== null) {
        if (
            typeof value !== "string" &&
            typeof value !== "number" &&
            typeof value !== "boolean"
        ) {
            return throwUnexpectedNodeError(node, tokens)
        }
    }
    const nn: JSONLiteral = {
        type: "JSONLiteral",
        value,
        raw: node.raw!,
        ...getFixLocation(node),
    }
    checkUnexpectKeys(node, tokens, nn)
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
        if (!isNumIdentifier(argument)) {
            return throwUnexpectedNodeError(argument, tokens)
        }
    } else {
        return throwUnexpectedNodeError(argument, tokens)
    }
    if (node.range![0] + 1 !== argument.range![0]) {
        return throwUnexpectedTokenError(" ", argument)
    }

    const nn: JSONUnaryExpression = {
        type: "JSONUnaryExpression",
        operator,
        prefix: true,
        argument: convertNode(argument, tokens) as
            | JSONNumberLiteral
            | JSONNumberIdentifier,
        ...getFixLocation(node),
    }
    checkUnexpectKeys(node, tokens, nn)
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
    checkUnexpectKeys(node, tokens, nn)
    return nn
}

/**
 * Check if given node is NaN or Infinity
 */
function isNumIdentifier(
    node: Identifier,
): node is Identifier & { name: "NaN" | "Infinity" } {
    return node.name === "NaN" || node.name === "Infinity"
}

/**
 * Check unknown keys
 */
function checkUnexpectKeys(
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
