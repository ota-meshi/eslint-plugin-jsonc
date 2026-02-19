import type { BaseRuleListener, PartialRuleModule, RuleModule } from "../types";
import { createRule } from "../utils";
import { getAutoConfig } from "../utils/get-auto-jsonc-rules-config";
import { getRules } from "../utils/rules";

export default createRule("auto", {
  meta: {
    docs: {
      description:
        "apply jsonc rules similar to your configured ESLint core rules",
      recommended: null,
      extensionRule: false,
      layout: false,
    },
    fixable: "code",
    schema: [],
    messages: {},
    type: "suggestion",
  },
  create(context, params) {
    if (!context.sourceCode.parserServices.isJSON) {
      return {};
    }
    const autoConfig = getAutoConfig(context.cwd, context.filename);

    const visitor: BaseRuleListener = {};
    for (const ruleId of Object.keys(autoConfig)) {
      const rule: RuleModule = getRules().find(
        (r) => r.meta.docs.ruleId === ruleId,
      )!;
      const subContext: any = {
        __proto__: context,
        options: getRuleOptions(autoConfig[ruleId], rule.jsoncDefineRule),
        report(options: any) {
          if (options.messageId) {
            options.message = `[${ruleId}] ${
              rule.meta.messages[options.messageId]
            }`;
            delete options.messageId;
          } else {
            options.message = `[${ruleId}] ${options.message}`;
          }
          context.report(options);
        },
      };
      const ruleVisitor: BaseRuleListener = rule.jsoncDefineRule.create(
        subContext,
        params,
      );
      for (const key of Object.keys(
        ruleVisitor,
      ) as (keyof BaseRuleListener)[]) {
        const newVisit = ruleVisitor[key];
        const oldVisit = visitor[key];
        if (!newVisit) {
          continue;
        }
        if (!oldVisit) {
          visitor[key] = ruleVisitor[key] as any;
        } else {
          visitor[key] = ((...args: [never]) => {
            oldVisit(...args);
            newVisit(...args);
          }) as any;
        }
      }
    }
    return visitor;
  },
});

/**
 * Build the options to create the rule.
 */
function getRuleOptions(
  options: number | string | any[],
  rule: PartialRuleModule,
): any[] {
  const jsonOptions = Array.isArray(options) ? options.slice(1) : [];
  if (rule.meta.defaultOptions) {
    rule.meta.defaultOptions.forEach((option, index) => {
      if (jsonOptions[index] === undefined) {
        jsonOptions[index] = option;
      }
    });
  }
  return jsonOptions;
}
