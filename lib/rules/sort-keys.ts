import coreRule from "eslint/lib/rules/sort-keys"
import { createRule, defineWrapperListener } from "../utils"

export default createRule("sort-keys", {
    meta: {
        docs: {
            description: "require object keys to be sorted",
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
