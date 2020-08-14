import type { AST } from "jsonc-eslint-parser"
import { createRule } from "../utils"

export default createRule("no-number-props", {
    meta: {
        docs: {
            description: "disallow number property keys",
            recommended: ["json", "jsonc", "json5"],
            extensionRule: false,
        },
        fixable: "code",
        schema: [],
        messages: {
            unexpected: "The number property keys are not allowed.",
        },
        type: "problem",
    },
    create(context) {
        return {
            JSONProperty(node: AST.JSONProperty) {
                if (node.key.type !== "JSONLiteral") {
                    return
                }
                if (typeof node.key.value === "number") {
                    const raw = node.key.raw
                    context.report({
                        loc: node.key.loc,
                        messageId: "unexpected",
                        fix(fixer) {
                            return fixer.replaceTextRange(
                                node.key.range,
                                `"${raw}"`,
                            )
                        },
                    })
                }
            },
        }
    },
})
