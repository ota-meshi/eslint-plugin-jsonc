import { JSONNode, JSONExpression } from "../parser/ast"

/**
 * Checks if given node is JSONExpression
 */
export function isExpression<N extends JSONNode>(
    node: N,
): node is N & JSONExpression {
    if (node.type === "JSONIdentifier") {
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
        node.type === "JSONLiteral"
    ) {
        return true
    }
    return false
}
