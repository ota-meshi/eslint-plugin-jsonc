import type { AST } from "jsonc-eslint-parser";
import { createRule } from "../utils";
import type { RuleListener } from "../types";

export default createRule("no-numeric-separators", {
  meta: {
    docs: {
      description: "disallow numeric separators",
      recommended: ["json", "jsonc", "json5"],
      extensionRule: false,
      layout: false,
    },
    fixable: "code",
    schema: [],
    messages: {
      unexpected: "Numeric separators are not allowed.",
    },
    type: "problem",
  },
  create(context) {
    if (!context.parserServices.isJSON) {
      return {} as RuleListener;
    }
    const sourceCode = context.getSourceCode();
    return {
      JSONLiteral(node: AST.JSONLiteral) {
        if (typeof node.value !== "number") {
          return;
        }
        const text = sourceCode.text.slice(...node.range);
        if (text.includes("_")) {
          context.report({
            loc: node.loc,
            messageId: "unexpected",
            fix(fixer) {
              return fixer.replaceTextRange(node.range, text.replace(/_/g, ""));
            },
          });
        }
      },
    };
  },
});
