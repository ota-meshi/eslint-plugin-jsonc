import { createRule, defineWrapperListener, getCoreRule } from "../utils"
const coreRule = getCoreRule("indent")

export default createRule("indent", {
    meta: {
        docs: {
            description: "enforce consistent indentation",
            recommended: null,
            extensionRule: true,
            layout: true,
        },
        fixable: coreRule.meta?.fixable,
        hasSuggestions: (coreRule as any).meta.hasSuggestions,
        schema: coreRule.meta!.schema!,
        messages: coreRule.meta!.messages!,
        type: coreRule.meta!.type!,
    },
    create(context) {
        return defineWrapperListener(coreRule, context, context.options)
    },
})
