import type { AST } from "jsonc-eslint-parser"
import { createRule } from "../utils"

export default createRule("no-parsing-error-in-vue-custom-block", {
    meta: {
        docs: {
            description: "disallow parsing errors in vue custom blocks",
            recommended: ["json", "json5", "jsonc"],
            extensionRule: false,
        },
        schema: [],
        messages: {},
        type: "problem",
    },
    create(context) {
        const parseError = context.parserServices.parseError
        if (parseError) {
            let loc: AST.Position | undefined = undefined
            if ("column" in parseError && "lineNumber" in parseError) {
                loc = {
                    line: parseError.lineNumber,
                    column: parseError.column,
                }
            }
            return {
                Program(node) {
                    context.report({
                        node,
                        loc,
                        message: parseError.message,
                    })
                },
            }
        }
        return {}
    },
})
