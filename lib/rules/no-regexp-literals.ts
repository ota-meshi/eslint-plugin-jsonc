import type { JSONLiteral } from "../parser/ast"
import { createRule } from "../utils"

export default createRule("no-regexp-literals", {
    meta: {
        docs: {
            description: "disallow RegExp literals",
            recommended: ["json", "jsonc", "json5"],
            extensionRule: false,
        },
        schema: [],
        messages: {
            unexpected: "RegExp literals keys are not allowed.",
        },
        type: "problem",
    },
    create(context) {
        return {
            JSONLiteral(node: JSONLiteral) {
                if (node.regex) {
                    context.report({
                        loc: node.loc,
                        messageId: "unexpected",
                    })
                }
            },
        }
    },
})
