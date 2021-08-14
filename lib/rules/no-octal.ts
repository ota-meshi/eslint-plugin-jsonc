import { createRule, defineWrapperListener, getCoreRule } from "../utils"
const coreRule = getCoreRule("no-octal")

export default createRule("no-octal", {
    meta: {
        docs: {
            description: "disallow legacy octal literals",
            // TODO major version recommended: ["json","jsonc","json5"],
            recommended: null,
            extensionRule: true,
            layout: false,
        },
        fixable: coreRule.meta?.fixable,hasSuggestions: (coreRule as any).hasSuggestions,
        schema: coreRule.meta!.schema!,
        messages: coreRule.meta!.messages!,
        type: coreRule.meta!.type!,
    },
    create(context) {
        return defineWrapperListener(coreRule, context, context.options)
    },
})
