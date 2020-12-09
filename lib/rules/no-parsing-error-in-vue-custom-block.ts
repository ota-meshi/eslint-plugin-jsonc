import type { AST } from "jsonc-eslint-parser"
import type { VAttribute, VElement } from "vue-eslint-parser/ast"
import { createRule } from "../utils"
import type { RuleListener } from "../types"
import * as jsoncESLintParser from "jsonc-eslint-parser"
import type { Rule } from "eslint"

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
    create(context, { customBlock }) {
        if (!customBlock) {
            return {}
        }
        const parseError = context.parserServices.parseError
        if (parseError) {
            return errorReportVisitor(context, parseError)
        }
        const parseCustomBlockElement:
            | ((parser: any, options: any) => any)
            | undefined = context.parserServices.parseCustomBlockElement
        const customBlockElement: VElement | undefined =
            context.parserServices.customBlock

        if (customBlockElement && parseCustomBlockElement) {
            let lang = getLang(customBlockElement)
            if (!lang) {
                lang = "json"
            }
            const { error } = parseCustomBlockElement(jsoncESLintParser, {
                jsonSyntax: lang,
            })
            if (error) {
                return errorReportVisitor(context, error)
            }
        }
        return {}
    },
})

/**
 * Report error
 */
function errorReportVisitor(
    context: Rule.RuleContext,
    error: any,
): RuleListener {
    let loc: AST.Position | undefined = undefined
    if ("column" in error && "lineNumber" in error) {
        loc = {
            line: error.lineNumber,
            column: error.column,
        }
    }
    return {
        Program(node) {
            context.report({
                node,
                loc,
                message: error.message,
            })
        },
    }
}

/**
 * Get lang from given custom block
 */
function getLang(customBlock: VElement) {
    return (
        customBlock.startTag.attributes.find(
            (attr): attr is VAttribute =>
                !attr.directive && attr.key.name === "lang",
        )?.value?.value || null
    )
}
