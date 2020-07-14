import type {
    JSONNode,
    JSONExpression,
    JSONNumberIdentifier,
    JSONIdentifier,
    JSONObjectExpression,
    JSONArrayExpression,
    JSONUnaryExpression,
    JSONNumberLiteral,
    JSONExpressionStatement,
    JSONProgram,
    JSONUndefinedIdentifier,
    JSONTemplateLiteral,
    JSONTemplateElement,
    JSONStringLiteral,
    JSONKeywordLiteral,
    JSONRegExpLiteral,
    JSONBigIntLiteral,
} from "../parser/ast"

/**
 * Checks if given node is JSONExpression
 */
export function isExpression<N extends JSONNode>(
    node: N,
): node is N & JSONExpression {
    if (node.type === "JSONIdentifier" || node.type === "JSONLiteral") {
        const parent = node.parent!
        if (parent.type === "JSONProperty" && parent.key === node) {
            return false
        }
        return true
    }
    if (
        node.type === "JSONObjectExpression" ||
        node.type === "JSONArrayExpression" ||
        node.type === "JSONUnaryExpression" ||
        node.type === "JSONTemplateLiteral"
    ) {
        return true
    }
    return false
}

/**
 * Checks if given node is JSONNumberIdentifier
 */
export function isNumberIdentifier(
    node: JSONIdentifier,
): node is JSONNumberIdentifier {
    return (
        isExpression(node) && (node.name === "Infinity" || node.name === "NaN")
    )
}

/**
 * Checks if given node is JSONUndefinedIdentifier
 */
export function isUndefinedIdentifier(
    node: JSONIdentifier,
): node is JSONUndefinedIdentifier {
    return isExpression(node) && node.name === "undefined"
}

export type JSONValue =
    | string
    | number
    | boolean
    | null
    | undefined
    | JSONObjectValue
    | JSONValue[]
    | RegExp
    | bigint
export type JSONObjectValue = { [key: string]: JSONValue }

export function getStaticJSONValue(
    node: JSONUnaryExpression | JSONNumberIdentifier | JSONNumberLiteral,
): number
export function getStaticJSONValue(node: JSONUndefinedIdentifier): undefined
export function getStaticJSONValue(node: JSONTemplateLiteral): string
export function getStaticJSONValue(node: JSONTemplateElement): string
export function getStaticJSONValue(node: JSONStringLiteral): string
export function getStaticJSONValue(node: JSONNumberLiteral): number
export function getStaticJSONValue(node: JSONKeywordLiteral): boolean | null
export function getStaticJSONValue(node: JSONRegExpLiteral): RegExp
export function getStaticJSONValue(node: JSONBigIntLiteral): bigint

export function getStaticJSONValue(node: JSONObjectExpression): JSONObjectValue
export function getStaticJSONValue(node: JSONArrayExpression): JSONValue[]
export function getStaticJSONValue(
    node: JSONExpression | JSONExpressionStatement,
): JSONValue
/* eslint-disable complexity */
/**
 * Gets the static value for the given node.
 */
export function getStaticJSONValue(
    node:
        | JSONExpression
        | JSONProgram
        | JSONExpressionStatement
        | JSONTemplateElement,
): JSONValue {
    /* eslint-enable complexity */
    if (node.type === "JSONObjectExpression") {
        const object: { [key: string]: JSONValue } = {}
        for (const prop of node.properties) {
            const keyName =
                prop.key.type === "JSONLiteral"
                    ? `${prop.key.value}`
                    : prop.key.name
            object[keyName] = getStaticJSONValue(prop.value)
        }
        return object
    }
    if (node.type === "JSONArrayExpression") {
        const array: JSONValue[] = []
        for (let index = 0; index < node.elements.length; index++) {
            const element = node.elements[index]
            if (element) {
                array[index] = getStaticJSONValue(element)
            }
        }
        return array
    }
    if (node.type === "JSONLiteral") {
        if (node.regex) {
            return new RegExp(node.regex.pattern, node.regex.flags)
        }
        if (node.bigint != null) {
            return BigInt(node.bigint)
        }
        return node.value
    }
    if (node.type === "JSONUnaryExpression") {
        const value = getStaticJSONValue(node.argument)
        return node.operator === "-" ? -value : value
    }
    if (node.type === "JSONIdentifier") {
        if (node.name === "Infinity") {
            return Infinity
        }
        if (node.name === "NaN") {
            return NaN
        }
        if (node.name === "undefined") {
            return undefined
        }
        throw new Error("Illegal argument")
    }
    if (node.type === "JSONTemplateLiteral") {
        return getStaticJSONValue(node.quasis[0])
    }
    if (node.type === "JSONTemplateElement") {
        return node.value.cooked
    }
    if (node.type === "Program") {
        if (
            node.body.length !== 1 ||
            node.body[0].type !== "JSONExpressionStatement"
        ) {
            throw new Error("Illegal argument")
        }
        return getStaticJSONValue(node.body[0])
    }
    if (node.type === "JSONExpressionStatement") {
        return getStaticJSONValue(node.expression)
    }
    throw new Error("Illegal argument")
}
