import { createRule, defineWrapperListener, getCoreRule } from "../utils"
const coreRule = getCoreRule("array-bracket-newline")

export default createRule("array-bracket-newline", {
    meta: {
        docs: {
            description:
                "enforce line breaks after opening and before closing array brackets",
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
