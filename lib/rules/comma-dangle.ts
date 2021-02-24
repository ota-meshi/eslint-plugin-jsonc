import { createRule, defineWrapperListener, getCoreRule } from "../utils"
const coreRule = getCoreRule("comma-dangle")

export default createRule("comma-dangle", {
    meta: {
        docs: {
            description: "require or disallow trailing commas",
            recommended: ["json"],
            extensionRule: true,
            layout: true,
        },
        fixable: coreRule.meta?.fixable,
        schema: coreRule.meta!.schema!,
        messages: coreRule.meta!.messages!,
        type: coreRule.meta!.type!,
    },
    create(context) {
        const options = [...context.options]
        if (!options[0]) {
            options[0] = "never"
        }
        return defineWrapperListener(coreRule, context, options)
    },
})
