import coreRule from "eslint/lib/rules/no-dupe-keys"
import { createRule, defineWrapperListener } from "../utils"

export default createRule("no-dupe-keys", {
    meta: {
        docs: {
            description: "disallow duplicate keys in object literals",
            recommended: ["json", "jsonc", "json5"],
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
