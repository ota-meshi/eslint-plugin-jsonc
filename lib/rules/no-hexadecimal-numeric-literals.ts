import type { AST } from "jsonc-eslint-parser"
import { createRule } from "../utils"

const hexadecimalNumericLiteralPattern = /^0[Xx]/u

export default createRule("no-hexadecimal-numeric-literals", {
    meta: {
        docs: {
            description: "disallow hexadecimal numeric literals",
            // TODO major version recommended: ["json","jsonc"],
            recommended: null,
            extensionRule: false,
            layout: false,
        },
        fixable: "code",
        messages: {
            disallow: "Hexadecimal numeric literals should not be used.",
        },
        schema: [],
        type: "problem",
    },
    create(context) {
        if (!context.parserServices.isJSON) {
            return {}
        }
        return {
            JSONLiteral(node: AST.JSONLiteral) {
                if (
                    typeof node.value === "number" &&
                    hexadecimalNumericLiteralPattern.test(node.raw)
                ) {
                    context.report({
                        loc: node.loc,
                        messageId: "disallow",
                        fix: (fixer) => {
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
