import type { AST } from "jsonc-eslint-parser"
import { createRule } from "../utils"

const octalNumericLiteralPattern = /^0[Oo]/u

export default createRule("no-octal-numeric-literals", {
    meta: {
        docs: {
            description: "disallow octal numeric literals",
            recommended: ["json", "jsonc", "json5"],
            extensionRule: false,
            layout: false,
        },
        fixable: "code",
        messages: {
            disallow: "Octal numeric literals should not be used.",
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
                    octalNumericLiteralPattern.test(node.raw)
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
