import type { AST } from "jsonc-eslint-parser"
import { isNumberIdentifier } from "jsonc-eslint-parser"
import { createRule } from "../utils"

export default createRule("no-infinity", {
    meta: {
        docs: {
            description: "disallow Infinity",
            // TODO major version recommended: ["json","jsonc"],
            recommended: null,
            extensionRule: false,
            layout: false,
        },
        messages: {
            disallow: "Infinity should not be used.",
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
                if (node.name === "Infinity") {
                    context.report({
                        loc: node.loc,
                        messageId: "disallow",
                    })
                }
            },
        }
    },
})
