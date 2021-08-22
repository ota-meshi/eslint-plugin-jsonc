import { createRule, defineWrapperListener, getCoreRule } from "../utils"
const coreRule = getCoreRule("object-curly-spacing")

export default createRule("object-curly-spacing", {
    meta: {
        docs: {
            description: "enforce consistent spacing inside braces",
            recommended: null,
            extensionRule: true,
            layout: true,
        },
        fixable: coreRule.meta?.fixable,
        hasSuggestions: (coreRule.meta as any).hasSuggestions,
        schema: coreRule.meta!.schema!,
        messages: coreRule.meta!.messages!,
        type: coreRule.meta!.type!,
    },
    create(context) {
        return defineWrapperListener(coreRule, context, context.options)
    },
})
