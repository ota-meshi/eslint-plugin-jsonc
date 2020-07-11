import type { JSONLiteral } from "../parser/ast"
import type { RuleListener } from "../types"
import { createRule } from "../utils"

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
        }
    },
})
