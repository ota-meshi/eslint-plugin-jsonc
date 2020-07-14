import coreRule from "eslint/lib/rules/space-unary-ops"
import { createRule, defineWrapperListener } from "../utils"

export default createRule("space-unary-ops", {
    meta: {
        docs: {
            description: "disallow spaces after unary operators",
            recommended: ["json", "jsonc", "json5"],
            extensionRule: true,
        },
        fixable: coreRule.meta?.fixable,
        schema: coreRule.meta?.schema!,
        messages: coreRule.meta?.messages!,
        type: coreRule.meta?.type!,
    },
    create(context) {
        return defineWrapperListener(coreRule, context, [{ nonwords: false }])
    },
})
