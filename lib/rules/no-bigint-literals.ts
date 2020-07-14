import type { JSONLiteral } from "../parser/ast"
import { createRule } from "../utils"

export default createRule("no-bigint-literals", {
    meta: {
        docs: {
            description: "disallow BigInt literals",
            recommended: ["json", "jsonc", "json5"],
            extensionRule: false,
        },
        schema: [],
        messages: {
            unexpected: "BigInt literals are not allowed.",
        },
        type: "problem",
    },
    create(context) {
        return {
            JSONLiteral(node: JSONLiteral) {
                if (node.bigint != null) {
                    context.report({
                        loc: node.loc,
                        messageId: "unexpected",
                    })
                }
            },
        }
    },
})
