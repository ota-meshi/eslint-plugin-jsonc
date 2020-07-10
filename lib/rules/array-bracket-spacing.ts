import coreRule from "eslint/lib/rules/array-bracket-spacing"
import { createRule, defineWrapperListener } from "../utils"

export default createRule("array-bracket-spacing", {
    meta: {
        docs: {
            description: "disallow or enforce spaces inside of brackets",
            recommended: null,
            extensionRule: true,
        },
        fixable: coreRule.meta?.fixable,
        schema: coreRule.meta?.schema!,
        messages: coreRule.meta?.messages!,
        type: coreRule.meta?.type!,
    },
    create(context) {
        return defineWrapperListener(coreRule, context, context.options)
    },
})
