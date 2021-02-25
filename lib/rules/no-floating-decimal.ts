import { createRule, defineWrapperListener, getCoreRule } from "../utils"
const coreRule = getCoreRule("no-floating-decimal")

export default createRule("no-floating-decimal", {
    meta: {
        docs: {
            description:
                "disallow leading or trailing decimal points in numeric literals",
            recommended: ["json", "jsonc"],
            extensionRule: true,
            layout: true,
        },
        fixable: coreRule.meta!.fixable,
        schema: coreRule.meta!.schema!,
        messages: coreRule.meta!.messages!,
        type: coreRule.meta!.type!,
    },
    create(context) {
        return defineWrapperListener(coreRule, context, context.options)
    },
})
