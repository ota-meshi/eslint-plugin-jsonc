import coreRule from "eslint/lib/rules/no-octal-escape"
import { createRule, defineWrapperListener } from "../utils"

export default createRule("no-octal-escape", {
    meta: {
        docs: {
            description: "disallow octal escape sequences in string literals",
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
