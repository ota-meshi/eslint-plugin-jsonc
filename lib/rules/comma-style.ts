import coreRule from "eslint/lib/rules/comma-style"
import { createRule, defineWrapperListener } from "../utils"

export default createRule("comma-style", {
    meta: {
        docs: {
            description: "enforce consistent comma style",
            recommended: null,
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
