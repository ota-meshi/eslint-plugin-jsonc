import type { RuleListener, RuleModule, PartialRuleModule } from "../types"
import type { Rule } from "eslint"
import type { AST } from "jsonc-eslint-parser"

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
        // eslint-disable-next-line @typescript-eslint/unbound-method -- special
        create: rule.create as never,
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
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment -- special
        // @ts-expect-error
        // eslint-disable-next-line @typescript-eslint/naming-convention -- special
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
        jsonListener[jsonKey] = function (node: AST.JSONNode, ...args) {
            original.call(this, getProxyNode(node) as never, ...args)
        }
    }

    /**
     *  Check whether a given value is a node.
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
    function getProxyNode(node: AST.JSONNode): any {
        const type = node.type.startsWith("JSON")
            ? node.type.slice(4)
            : node.type
        const cache: any = { type }
        return new Proxy(node, {
            get(_t, key) {
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
