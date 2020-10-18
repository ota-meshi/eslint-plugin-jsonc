import { createRule, defineWrapperListener, getCoreRule } from "../utils"
const coreRule = getCoreRule("array-bracket-spacing")

export default createRule("array-bracket-spacing", {
    meta: {
        docs: {
            description: "disallow or enforce spaces inside of brackets",
            recommended: null,
            extensionRule: true,
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
