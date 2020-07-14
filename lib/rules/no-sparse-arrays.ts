import coreRule from "eslint/lib/rules/no-sparse-arrays"
import { createRule, defineWrapperListener } from "../utils"

export default createRule("no-sparse-arrays", {
    meta: {
        docs: {
            description: "disallow sparse arrays",
            recommended: ["json", "jsonc", "json5"],
            extensionRule: true,
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
