import { createRule, defineWrapperListener, getCoreRule } from "../utils"
const coreRule = getCoreRule("comma-style")

export default createRule("comma-style", {
    meta: {
        docs: {
            description: "enforce consistent comma style",
            recommended: null,
            extensionRule: true,
            layout: true,
        },
        fixable: coreRule.meta?.fixable,
        hasSuggestions: (coreRule as any).hasSuggestions,
        schema: coreRule.meta!.schema!,
        messages: coreRule.meta!.messages!,
        type: coreRule.meta!.type!,
    },
    create(context) {
        return defineWrapperListener(coreRule, context, context.options)
    },
})
