import type {
    JSONLiteral,
    JSONUnaryExpression,
    JSONIdentifier,
} from "../parser/ast"
import type { RuleListener } from "../types"
import { createRule } from "../utils"
import { isExpression } from "../utils/ast"

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
        },
        type: "problem",
    },
    create(context) {
        if (!context.parserServices.isJSON) {
            return {} as RuleListener
        }
        const sourceCode = context.getSourceCode()
        return {
            JSONUnaryExpression(node: JSONUnaryExpression) {
                if (node.operator === "+") {
                    if (node.argument.type === "JSONIdentifier") {
                        return
                    }
                    context.report({
                        loc: node.loc,
                        messageId: "invalid",
                        fix(fixer) {
                            return fixer.removeRange([
                                node.range[0],
                                node.range[0] + 1,
                            ])
                        },
                    })
                }
            },
            JSONLiteral(node: JSONLiteral) {
                if (typeof node.value !== "number") {
                    return
                }
                const text = sourceCode.text.slice(...node.range)
                try {
                    JSON.parse(text)
                } catch {
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
            JSONIdentifier(node: JSONIdentifier) {
                if (!isExpression(node)) {
                    return
                }
                context.report({
                    loc: node.loc,
                    messageId: "invalid",
                })
            },
        }
    },
})
