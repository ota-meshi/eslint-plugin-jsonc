import { getCwd, getFilename } from "eslint-compat-utils";
import type { BaseRuleListener, RuleModule } from "../types";
import { createRule, isJson } from "../utils";
import { getAutoConfig } from "../utils/get-auto-jsonc-rules-config";

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
    if (!isJson(context)) {
      return {};
    }
    const autoConfig = getAutoConfig(getCwd(context), getFilename(context));

    const visitor: BaseRuleListener = {};
    for (const ruleId of Object.keys(autoConfig)) {
      // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires -- special rule
      const rule: RuleModule = require(
        `./${ruleId.replace(/^jsonc\//u, "")}`,
      ).default;
      const subContext: any = {
        __proto__: context,
        options: getRuleOptions(autoConfig[ruleId]),
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
function getRuleOptions(options: number | string | any[]): any[] {
  if (!Array.isArray(options)) {
    return [];
  }
  return options.slice(1);
}
