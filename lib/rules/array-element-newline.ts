import coreRule from "eslint/lib/rules/array-element-newline"
import { createRule, defineWrapperListener } from "../utils"

export default createRule("array-element-newline", {
    meta: {
        docs: {
            description: "enforce line breaks between array elements",
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
