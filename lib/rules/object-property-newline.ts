import coreRule from "eslint/lib/rules/object-property-newline"
import { createRule, defineWrapperListener } from "../utils"

export default createRule("object-property-newline", {
    meta: {
        docs: {
            description: "enforce placing object properties on separate lines",
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
