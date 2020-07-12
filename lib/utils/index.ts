import type { RuleListener, RuleModule, PartialRuleModule } from "../types"
import type { Rule } from "eslint"
import { JSONNode } from "../parser/ast"

/**
 * Define the rule.
 * @param ruleName ruleName
 * @param rule rule module
 */
export function createRule(
    ruleName: string,
    rule: PartialRuleModule,
): RuleModule {
    return {
        meta: {
            ...rule.meta,
            docs: {
                ...rule.meta.docs,
                url: `https://ota-meshi.github.io/eslint-plugin-jsonc/rules/${ruleName}.html`,
                ruleId: `jsonc/${ruleName}`,
                ruleName,
            },
        },
        create: rule.create as any,
    }
}

/**
 * Define the wrapped core rule.
 */
export function defineWrapperListener(
    coreRule: Rule.RuleModule,
    context: Rule.RuleContext,
    options: any[],
): RuleListener {
    if (!context.parserServices.isJSON) {
        return {}
    }
    const listener = coreRule.create({
        // @ts-expect-error
        __proto__: context,
        options,
    }) as RuleListener

    const jsonListener: RuleListener = {}
    for (const key of Object.keys(listener)) {
        const original = listener[key]
        const jsonKey = key.replace(
            /(?:^|\b)(ExpressionStatement|ArrayExpression|ObjectExpression|Property|Identifier|Literal|UnaryExpression)(?:\b|$)/gu,
            "JSON$1",
        )
        jsonListener[jsonKey] = function (node: JSONNode, ...args) {
            original.call(this, getProxyNode(node) as never, ...args)
        }
    }

    /**
     *  Check wheather a given value is a node.
     */
    function isNode(data: any): boolean {
        return (
            data &&
            typeof data.type === "string" &&
            Array.isArray(data.range) &&
            data.range.length === 2 &&
            typeof data.range[0] === "number" &&
            typeof data.range[1] === "number"
        )
    }

    /**
     * Get the proxy node
     */
    function getProxyNode(node: JSONNode): any {
        const cache: any = {}
        const type = node.type.startsWith("JSON")
            ? node.type.slice(4)
            : node.type
        return new Proxy(node, {
            get(_t, key) {
                if (key === "type") {
                    return type
                }
                if (key === "kind" && node.type === "JSONProperty") {
                    return "init"
                }
                if (key in cache) {
                    return cache[key]
                }
                const data = (node as any)[key]
                if (isNode(data)) {
                    return (cache[key] = getProxyNode(data))
                }
                if (Array.isArray(data)) {
                    return (cache[key] = data.map((e) =>
                        isNode(e) ? getProxyNode(e) : e,
                    ))
                }
                return data
            },
        })
    }

    return jsonListener
}
