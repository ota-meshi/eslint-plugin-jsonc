import type { RuleListener, RuleModule, PartialRuleModule } from "../types";
import type { Rule } from "eslint";
import type { AST } from "jsonc-eslint-parser";
import * as jsoncESLintParser from "jsonc-eslint-parser";
import type { AST as V } from "vue-eslint-parser";
import path from "path";
import { getFilename, getSourceCode } from "eslint-compat-utils";

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
    jsoncDefineRule: rule,
    create(context: Rule.RuleContext) {
      const sourceCode = getSourceCode(context);
      if (
        typeof sourceCode.parserServices.defineCustomBlocksVisitor ===
          "function" &&
        path.extname(getFilename(context)) === ".vue"
      ) {
        return sourceCode.parserServices.defineCustomBlocksVisitor(
          context,
          jsoncESLintParser,
          {
            target(lang: string | null, block: V.VElement) {
              if (lang) {
                return /^json[5c]?$/i.test(lang);
              }
              return block.name === "i18n";
            },
            create(blockContext: Rule.RuleContext) {
              return rule.create(blockContext, {
                customBlock: true,
              });
            },
          },
        );
      }
      return rule.create(context, {
        customBlock: false,
      });
    },
  };
}

/**
 * Define the wrapped core rule.
 */
export function defineWrapperListener(
  coreRule: Rule.RuleModule,
  context: Rule.RuleContext,
  options: any[],
): RuleListener {
  const sourceCode = getSourceCode(context);
  if (!sourceCode.parserServices.isJSON) {
    return {};
  }
  const listener = coreRule.create({
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment -- special
    // @ts-expect-error
    __proto__: context,
    options,
  }) as RuleListener;

  const jsonListener: RuleListener = {};
  for (const key of Object.keys(listener)) {
    const original = listener[key];
    if (!original) {
      continue;
    }
    const jsonKey = key.replace(
      /(?:^|\b)(ExpressionStatement|(?:Template)?Literal|(?:Array|Object|Unary)Expression|Property|Identifier|TemplateElement)(?:\b|$)/gu,
      "JSON$1",
    );
    jsonListener[jsonKey] = function (node: AST.JSONNode, ...args) {
      original.call(this, getProxyNode(node) as never, ...args);
    };
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
    );
  }

  /**
   * Get the proxy node
   */
  function getProxyNode(node: AST.JSONNode): any {
    const type = node.type.startsWith("JSON") ? node.type.slice(4) : node.type;
    const cache: any = { type };
    return new Proxy(node, {
      get(_t, key) {
        if (key in cache) {
          return cache[key];
        }
        const data = (node as any)[key];
        if (isNode(data)) {
          return (cache[key] = getProxyNode(data));
        }
        if (Array.isArray(data)) {
          return (cache[key] = data.map((e) =>
            isNode(e) ? getProxyNode(e) : e,
          ));
        }
        return data;
      },
    });
  }

  return jsonListener;
}

let ruleMap: Map<string, Rule.RuleModule> | null = null;

/**
 * Get the core rule implementation from the rule name
 */
export function getCoreRule(name: string): Rule.RuleModule {
  let map: Map<string, Rule.RuleModule>;
  if (ruleMap) {
    map = ruleMap;
  } else {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires -- load eslint
    ruleMap = map = new (require("eslint").Linter)().getRules();
  }
  return map.get(name)!;
}
