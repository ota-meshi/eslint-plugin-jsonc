import coreRule from "eslint/lib/rules/array-bracket-newline"
import { createRule, defineWrapperListener } from "../utils"

export default createRule("array-bracket-newline", {
    meta: {
        docs: {
            description:
                "enforce line breaks after opening and before closing array brackets",
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
