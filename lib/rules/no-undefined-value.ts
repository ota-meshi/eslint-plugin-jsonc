import type { JSONIdentifier } from "../parser/ast"
import { createRule } from "../utils"
import { isUndefinedIdentifier } from "../utils/ast"

export default createRule("no-undefined-value", {
    meta: {
        docs: {
            description: "disallow `undefined`",
            recommended: ["json", "jsonc", "json5"],
            extensionRule: false,
        },
        schema: [],
        messages: {
            unexpected: "`undefined` is not allowed.",
        },
        type: "problem",
    },
    create(context) {
        return {
            JSONIdentifier(node: JSONIdentifier) {
                if (!isUndefinedIdentifier(node)) {
                    return
                }
                context.report({
                    loc: node.loc,
                    messageId: "unexpected",
                })
            },
        }
    },
})
