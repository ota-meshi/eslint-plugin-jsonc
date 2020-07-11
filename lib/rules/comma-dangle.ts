import coreRule from "eslint/lib/rules/comma-dangle"
import { createRule, defineWrapperListener } from "../utils"

export default createRule("comma-dangle", {
    meta: {
        docs: {
            description: "require or disallow trailing commas",
            recommended: ["json"],
            extensionRule: true,
        },
        fixable: coreRule.meta?.fixable,
        schema: coreRule.meta?.schema!,
        messages: coreRule.meta?.messages!,
        type: coreRule.meta?.type!,
    },
    create(context) {
        const options = [...context.options]
        if (!options[0]) {
            options[0] = "never"
        }
        return defineWrapperListener(coreRule, context, options)
    },
})
