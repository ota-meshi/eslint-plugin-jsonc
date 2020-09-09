import type { AST } from "jsonc-eslint-parser"
import { isUndefinedIdentifier } from "jsonc-eslint-parser"
import { createRule } from "../utils"

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
            JSONIdentifier(node: AST.JSONIdentifier) {
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
