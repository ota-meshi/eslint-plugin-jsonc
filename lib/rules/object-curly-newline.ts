import coreRule from "eslint/lib/rules/object-curly-newline"
import { createRule, defineWrapperListener } from "../utils"

export default createRule("object-curly-newline", {
    meta: {
        docs: {
            description: "enforce consistent line breaks inside braces",
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
