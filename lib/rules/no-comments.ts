import type { RuleListener } from "../types"
import { createRule } from "../utils"

export default createRule("no-comments", {
    meta: {
        docs: {
            description: "disallow comments",
            recommended: ["json"],
            extensionRule: false,
            layout: false,
        },
        schema: [],
        messages: {
            unexpected: "Unexpected comment.",
        },
        type: "problem",
    },
    create(context) {
        if (!context.parserServices.isJSON) {
            return {} as RuleListener
        }
        const sourceCode = context.getSourceCode()
        return {
            Program() {
                for (const comment of sourceCode.getAllComments()) {
                    context.report({
                        loc: comment.loc!,
                        messageId: "unexpected",
                    })
                }
            },
        }
    },
})
