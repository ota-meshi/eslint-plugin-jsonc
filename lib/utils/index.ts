import type { RuleListener, RuleModule, PartialRuleModule } from "../types";
import type { Rule } from "eslint";
import type { AST } from "jsonc-eslint-parser";
import * as jsoncESLintParser from "jsonc-eslint-parser";
import type { AST as V } from "vue-eslint-parser";
import path from "path";
import { getFilename, getSourceCode } from "eslint-compat-utils";
import {
  compatMomoaRuleListener,
  getSourceCode as getCompatSourceCode,
} from "./compat-momoa";

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
        typeof sourceCode.parserServices?.defineCustomBlocksVisitor ===
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
              return compatMomoaRuleListener(
                rule.create(blockContext, {
                  customBlock: true,
                }),
                blockContext,
              );
            },
          },
        );
      }
      return compatMomoaRuleListener(
        rule.create(context, {
          customBlock: false,
        }),
        context,
      );
    },
  };
}

/**
 * Checks the context and returns whether a JSON parser is being used or not.
 */
export function isJson(context: Rule.RuleContext): boolean {
  const sourceCode = getSourceCode(context);
  if (sourceCode.parserServices?.isJSON) {
    return true;
  }
  // *** Check for momoa ***
  if (context.parserPath) {
    // Using a legacy configuration, so momoa is not used.
    return false;
  }
  const parser = context.languageOptions?.parser;
  if (parser) {
    if ("parse" in parser && typeof parser?.parse === "function") {
      try {
        const ast = parser.parse("{}");
        return (ast as any).type === "Document";
      } catch {
        return false;
      }
    }
  } else {
    // If no parser is specified, it will parse according to the `language` config.

    // If the root node of the AST of a source code class instance is `Document`,
    // it is probably a node parsed by momoa.
    return (sourceCode.ast.type as string) === "Document";
  }
  return false;
}

/**
 * Define the wrapped core rule.
 */
export function defineWrapperListener(
  coreRule: Rule.RuleModule,
  context: Rule.RuleContext,
  options: any[],
): RuleListener {
  if (!isJson(context)) {
    return {};
  }
  const listener = coreRule.create({
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment -- special
    // @ts-expect-error
    __proto__: context,
    options,
    get sourceCode() {
      return getCompatSourceCode(context);
    },
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
export function getCoreRule(
  name:
    | "no-dupe-keys"
    | "no-floating-decimal"
    | "no-irregular-whitespace"
    | "no-multi-str"
    | "no-octal-escape"
    | "no-octal"
    | "no-sparse-arrays"
    | "no-useless-escape",
): Rule.RuleModule {
  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires -- load eslint
  const eslint = require("eslint");
  try {
    const map = ruleMap || (ruleMap = new eslint.Linter().getRules());
    return map.get(name) || null;
  } catch {
    // getRules() is no longer available in flat config.
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires -- load eslint
  const { builtinRules } = require("eslint/use-at-your-own-risk");
  return /** @type {any} */ builtinRules.get(name) || null;
}
