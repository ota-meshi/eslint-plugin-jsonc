import type { AST } from "jsonc-eslint-parser"
import type { RuleListener } from "../types"
import { createRule } from "../utils"
import type { CasingKind } from "../utils/casing"
import { getChecker, allowedCaseOptions } from "../utils/casing"

type Option = {
    [key in CasingKind]?: boolean
} & {
    ignores?: string[]
}

export default createRule("key-name-casing", {
    meta: {
        docs: {
            description: "enforce naming convention to property key names",
            recommended: null,
            extensionRule: false,
            layout: false,
        },
        schema: [
            {
                type: "object",
                properties: {
                    camelCase: {
                        type: "boolean",
                        default: true,
                    },
                    // eslint-disable-next-line @typescript-eslint/naming-convention -- option
                    PascalCase: {
                        type: "boolean",
                        default: false,
                    },
                    // eslint-disable-next-line @typescript-eslint/naming-convention -- option
                    SCREAMING_SNAKE_CASE: {
                        type: "boolean",
                        default: false,
                    },
                    "kebab-case": {
                        type: "boolean",
                        default: false,
                    },
                    // eslint-disable-next-line @typescript-eslint/naming-convention -- option
                    snake_case: {
                        type: "boolean",
                        default: false,
                    },
                    ignores: {
                        type: "array",
                        items: {
                            type: "string",
                        },
                        uniqueItems: true,
                        additionalItems: false,
                    },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            doesNotMatchFormat:
                "Property name `{{name}}` must match one of the following formats: {{formats}}",
        },
        type: "suggestion",
    },
    create(context) {
        if (!context.parserServices.isJSON) {
            return {} as RuleListener
        }
        const sourceCode = context.getSourceCode()
        const option: Option = { ...context.options[0] }
        if (option.camelCase !== false) {
            option.camelCase = true
        }
        const ignores = option.ignores
            ? option.ignores.map((ignore) => new RegExp(ignore))
            : []
        const formats = Object.keys(option)
            .filter((key): key is CasingKind =>
                allowedCaseOptions.includes(key as CasingKind),
            )
            .filter((key) => option[key])

        const checkers: ((str: string) => boolean)[] = formats.map(getChecker)

        /**
         * Check whether a given name is a valid.
         */
        function isValid(name: string): boolean {
            if (ignores.some((regex) => regex.test(name))) {
                return true
            }
            return checkers.length ? checkers.some((c) => c(name)) : true
        }

        return {
            JSONProperty(node: AST.JSONProperty) {
                const name =
                    node.key.type === "JSONLiteral" &&
                    typeof node.key.value === "string"
                        ? node.key.value
                        : sourceCode.text.slice(...node.key.range)
                if (!isValid(name)) {
                    context.report({
                        loc: node.key.loc,
                        messageId: "doesNotMatchFormat",
                        data: {
                            name,
                            formats: formats.join(", "),
                        },
                    })
                }
            },
        }
    },
})
