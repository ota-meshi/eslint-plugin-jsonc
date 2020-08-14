/**
 *  Taken with https://github.com/eslint/eslint/blob/master/lib/rules/sort-keys.js
 */
import naturalCompare from "natural-compare"
import { createRule } from "../utils"
import { isCommaToken } from "eslint-utils"
import type { JSONProperty, JSONObjectExpression } from "../parser/ast"
import { getStaticJSONValue } from "../utils/ast"

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

/**
 * Gets the property name of the given `Property` node.
 */
function getPropertyName(node: JSONProperty): string {
    const prop = node.key
    if (prop.type === "JSONIdentifier") {
        return prop.name
    }
    return String(getStaticJSONValue(prop))
}

/**
 * Build function which check that the given 2 names are in specific order.
 */
function buildValidator(order: Option, insensitive: boolean, natural: boolean) {
    let compare = natural
        ? ([a, b]: string[]) => naturalCompare(a, b) <= 0
        : ([a, b]: string[]) => a <= b
    if (insensitive) {
        const baseCompare = compare
        compare = ([a, b]: string[]) =>
            baseCompare([a.toLowerCase(), b.toLowerCase()])
    }
    if (order === "desc") {
        const baseCompare = compare
        compare = (args: string[]) => baseCompare(args.reverse())
    }
    return (a: string, b: string) => compare([a, b])
}

const allowOptions = ["asc", "desc"] as const
type Option = typeof allowOptions[number]

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

export default createRule("sort-keys", {
    meta: {
        docs: {
            description: "require object keys to be sorted",
            recommended: null,
            extensionRule: true,
        },
        fixable: "code",
        schema: [
            {
                enum: allowOptions,
            },
            {
                type: "object",
                properties: {
                    caseSensitive: {
                        type: "boolean",
                        default: true,
                    },
                    natural: {
                        type: "boolean",
                        default: false,
                    },
                    minKeys: {
                        type: "integer",
                        minimum: 2,
                        default: 2,
                    },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            sortKeys:
                "Expected object keys to be in {{natural}}{{insensitive}}{{order}}ending order. '{{thisName}}' should be before '{{prevName}}'.",
        },
        type: "suggestion",
    },
    create(context) {
        // Parse options.
        const order: Option = context.options[0] || "asc"
        const options = context.options[1]
        const insensitive: boolean = options && options.caseSensitive === false
        const natural: boolean = options && options.natural
        const minKeys: number = options && options.minKeys
        const isValidOrder = buildValidator(order, insensitive, natural)
        type Stack = {
            upper: Stack | null
            prevList: { name: string; node: JSONProperty }[]
            numKeys: number
        }
        let stack: Stack = { upper: null, prevList: [], numKeys: 0 }

        return {
            JSONObjectExpression(node: JSONObjectExpression) {
                stack = {
                    upper: stack,
                    prevList: [],
                    numKeys: node.properties.length,
                }
            },

            "JSONObjectExpression:exit"() {
                stack = stack.upper!
            },

            JSONProperty(node: JSONProperty) {
                const prevList = stack.prevList
                const numKeys = stack.numKeys
                const thisName = getPropertyName(node)

                stack.prevList = [
                    {
                        name: thisName,
                        node,
                    },
                    ...prevList,
                ]
                if (prevList.length === 0 || numKeys < minKeys) {
                    return
                }
                const prevName = prevList[0].name
                if (!isValidOrder(prevName, thisName)) {
                    context.report({
                        loc: node.key.loc,
                        messageId: "sortKeys",
                        data: {
                            thisName,
                            prevName,
                            order,
                            insensitive: insensitive ? "insensitive " : "",
                            natural: natural ? "natural " : "",
                        },
                        *fix(fixer) {
                            const sourceCode = context.getSourceCode()
                            let moveTarget = prevList[0].node
                            for (const prev of prevList) {
                                if (isValidOrder(prev.name, thisName)) {
                                    break
                                } else {
                                    moveTarget = prev.node
                                }
                            }

                            const beforeToken = sourceCode.getTokenBefore(
                                node as never,
                            )!
                            const afterToken = sourceCode.getTokenAfter(
                                node as never,
                            )!
                            const hasAfterComma = isCommaToken(afterToken)
                            const codeStart = beforeToken.range[1] // to include comments
                            const codeEnd = hasAfterComma
                                ? afterToken.range[1] // |/**/ key: value,|
                                : node.range[1] // |/**/ key: value|
                            const removeStart = hasAfterComma
                                ? codeStart // |/**/ key: value,|
                                : beforeToken.range[0] // |,/**/ key: value|

                            const insertCode =
                                sourceCode.text.slice(codeStart, codeEnd) +
                                (hasAfterComma ? "" : ",")

                            const insertTarget = sourceCode.getTokenBefore(
                                moveTarget as never,
                            )!
                            yield fixer.insertTextAfterRange(
                                insertTarget.range,
                                insertCode,
                            )

                            yield fixer.removeRange([removeStart, codeEnd])
                        },
                    })
                }
            },
        }
    },
})
