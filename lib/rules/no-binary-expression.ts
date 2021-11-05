import type { AST } from "jsonc-eslint-parser"
import { getStaticJSONValue } from "jsonc-eslint-parser"
import { createRule } from "../utils"

export default createRule("no-binary-expression", {
    meta: {
        docs: {
            description: "disallow binary expression",
            // TODO major version recommended: ["json","jsonc","json5"],
            recommended: null,
            // recommended: ["json", "jsonc", "json5"],
            extensionRule: false,
            layout: false,
        },
        fixable: "code",
        hasSuggestions: false,
        schema: [],
        messages: {
            disallow: "The binary expressions are not allowed.",
        },
        type: "problem",
    },
    create(context) {
        if (!context.parserServices.isJSON) {
            return {}
        }

        return {
            JSONBinaryExpression(node: AST.JSONBinaryExpression) {
                context.report({
                    loc: node.loc,
                    messageId: "disallow",
                    fix(fixer) {
                        const value = getStaticJSONValue(node)
                        return fixer.replaceTextRange(
                            node.range,
                            JSON.stringify(value),
                        )
                    },
                })
            },
        }
    },
})
