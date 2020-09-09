import type { AST } from "jsonc-eslint-parser"
import { isNumberIdentifier } from "jsonc-eslint-parser"
import type { RuleListener } from "../types"
import { createRule } from "../utils"

/**
 * Checks if the given string is valid number as JSON.
 */
function isValidNumber(text: string): boolean {
    if (text.startsWith(".") || text.endsWith(".")) {
        return false
    }
    try {
        JSON.parse(text)
    } catch {
        return false
    }
    return true
}

export default createRule("valid-json-number", {
    meta: {
        docs: {
            description: "disallow invalid number for JSON",
            recommended: ["json", "jsonc"],
            extensionRule: false,
        },
        fixable: "code",
        schema: [],
        messages: {
            invalid: "Invalid number for JSON.",
            invalidSpace: "Spaces after minus sign are not allowed in JSON.",
            invalidPlus: "Plus signs are not allowed in JSON.",
            invalidIdentifier: "`{{name}}` are not allowed in JSON.",
        },
        type: "problem",
    },
    create(context) {
        if (!context.parserServices.isJSON) {
            return {} as RuleListener
        }
        const sourceCode = context.getSourceCode()
        return {
            JSONUnaryExpression(node: AST.JSONUnaryExpression) {
                if (node.argument.type === "JSONIdentifier") {
                    return
                }
                const operator = sourceCode.getFirstToken(
                    node as any,
                    (token) =>
                        token.type === "Punctuator" &&
                        token.value === node.operator,
                )
                if (node.operator === "+") {
                    context.report({
                        loc: operator?.loc || node.loc,
                        messageId: "invalidPlus",
                        fix(fixer) {
                            return operator ? fixer.remove(operator) : null
                        },
                    })
                } else if (
                    operator &&
                    operator.range[1] < node.argument.range[0]
                ) {
                    context.report({
                        loc: {
                            start: operator.loc.end,
                            end: node.argument.loc.start,
                        },
                        messageId: "invalidSpace",
                        fix(fixer) {
                            return fixer.removeRange([
                                operator.range[1],
                                node.argument.range[0],
                            ])
                        },
                    })
                }
            },
            JSONLiteral(node: AST.JSONLiteral) {
                if (typeof node.value !== "number") {
                    return
                }
                const text = sourceCode.text.slice(...node.range)
                if (!isValidNumber(text)) {
                    context.report({
                        loc: node.loc,
                        messageId: "invalid",
                        fix(fixer) {
                            return fixer.replaceTextRange(
                                node.range,
                                `${node.value}`,
                            )
                        },
                    })
                }
            },
            JSONIdentifier(node: AST.JSONIdentifier) {
                if (!isNumberIdentifier(node)) {
                    return
                }
                context.report({
                    loc: node.loc,
                    messageId: "invalidIdentifier",
                    data: {
                        name: node.name,
                    },
                })
            },
        }
    },
})
