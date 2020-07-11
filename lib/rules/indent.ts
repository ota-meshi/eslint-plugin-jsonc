import coreRule from "eslint/lib/rules/indent"
import { createRule, defineWrapperListener } from "../utils"

export default createRule("indent", {
    meta: {
        docs: {
            description: "enforce consistent indentation",
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
