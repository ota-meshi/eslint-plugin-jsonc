import coreRule from "eslint/lib/rules/no-useless-escape"
import { createRule, defineWrapperListener } from "../utils"

export default createRule("no-useless-escape", {
    meta: {
        docs: {
            description: "disallow unnecessary escape usage",
            recommended: ["json", "jsonc", "json5"],
            extensionRule: true,
        },
        fixable: coreRule.meta?.fixable,
        schema: coreRule.meta?.schema!,
        messages: coreRule.meta?.messages!,
        type: coreRule.meta?.type!,
    },
    create(context) {
        return defineWrapperListener(coreRule, context, context.options)
    },
})
