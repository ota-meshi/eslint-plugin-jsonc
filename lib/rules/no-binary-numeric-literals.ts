import type { AST } from "jsonc-eslint-parser"
import { createRule } from "../utils"

const binaryNumericLiteralPattern = /^0[bB]/u

export default createRule("no-binary-numeric-literals", {
    meta: {
        docs: {
            description: "disallow binary numeric literals",
            // TODO major version recommended: ["json","jsonc","json5"],
            recommended: null,
            extensionRule: false,
            layout: false,
        },
        fixable: "code",
        messages: {
            disallow: "Binary numeric literals should not be used.",
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
                    binaryNumericLiteralPattern.test(node.raw)
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
