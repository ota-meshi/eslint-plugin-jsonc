import { createRule, defineWrapperListener, getCoreRule } from "../utils"
const coreRule = getCoreRule("no-multi-str")

export default createRule("no-multi-str", {
    meta: {
        docs: {
            description: "disallow multiline strings",
            recommended: ["json", "jsonc"],
            extensionRule: true,
            layout: false,
        },
        fixable: coreRule.meta?.fixable,
        hasSuggestions: (coreRule as any).hasSuggestions,
        schema: coreRule.meta!.schema!,
        messages: {
            ...coreRule.meta!.messages!,
            multilineString: "Multiline support is limited to JSON5 only.",
        },
        type: coreRule.meta!.type!,
    },
    create(context) {
        return defineWrapperListener(coreRule, context, context.options)
    },
})
