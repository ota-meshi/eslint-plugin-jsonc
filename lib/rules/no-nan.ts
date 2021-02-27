import type { AST } from "jsonc-eslint-parser"
import { isNumberIdentifier } from "jsonc-eslint-parser"
import { createRule } from "../utils"

export default createRule("no-nan", {
    meta: {
        docs: {
            description: "disallow NaN",
            // TODO major version recommended: ["json","jsonc"],
            recommended: null,
            extensionRule: false,
            layout: false,
        },
        messages: {
            disallow: "NaN should not be used.",
        },
        schema: [],
        type: "problem",
    },
    create(context) {
        if (!context.parserServices.isJSON) {
            return {}
        }
        return {
            JSONIdentifier(node: AST.JSONIdentifier) {
                if (!isNumberIdentifier(node)) {
                    return
                }
                if (node.name === "NaN") {
                    context.report({
                        loc: node.loc,
                        messageId: "disallow",
                    })
                }
            },
        }
    },
})
