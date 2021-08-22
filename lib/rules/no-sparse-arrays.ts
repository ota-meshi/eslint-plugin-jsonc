import { createRule, defineWrapperListener, getCoreRule } from "../utils"
const coreRule = getCoreRule("no-sparse-arrays")

export default createRule("no-sparse-arrays", {
    meta: {
        docs: {
            description: "disallow sparse arrays",
            recommended: ["json", "jsonc", "json5"],
            extensionRule: true,
            layout: false,
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
