import { createRule, defineWrapperListener, getCoreRule } from "../utils"
const coreRule = getCoreRule("key-spacing")

export default createRule("key-spacing", {
    meta: {
        docs: {
            description:
                "enforce consistent spacing between keys and values in object literal properties",
            recommended: null,
            extensionRule: true,
            layout: true,
        },
        fixable: coreRule.meta?.fixable,
        schema: coreRule.meta!.schema!,
        messages: coreRule.meta!.messages!,
        type: coreRule.meta!.type!,
    },
    create(context) {
        return defineWrapperListener(coreRule, context, context.options)
    },
})
