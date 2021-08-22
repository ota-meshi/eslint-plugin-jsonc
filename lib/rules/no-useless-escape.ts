import { createRule, defineWrapperListener, getCoreRule } from "../utils"
const coreRule = getCoreRule("no-useless-escape")

export default createRule("no-useless-escape", {
    meta: {
        docs: {
            description: "disallow unnecessary escape usage",
            recommended: ["json", "jsonc", "json5"],
            extensionRule: true,
            layout: false,
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
