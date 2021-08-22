import { createRule, defineWrapperListener, getCoreRule } from "../utils"
const coreRule = getCoreRule("object-curly-newline")

export default createRule("object-curly-newline", {
    meta: {
        docs: {
            description: "enforce consistent line breaks inside braces",
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
