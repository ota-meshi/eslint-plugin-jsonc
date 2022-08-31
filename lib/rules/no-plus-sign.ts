import type { AST } from "jsonc-eslint-parser";
import { createRule } from "../utils";

export default createRule("no-plus-sign", {
  meta: {
    docs: {
      description: "disallow plus sign",
      recommended: ["json", "jsonc"],
      extensionRule: false,
      layout: false,
    },
    fixable: "code",
    messages: {
      disallow: "Plus sign should not be used.",
    },
    schema: [],
    type: "problem",
  },
  create(context) {
    if (!context.parserServices.isJSON) {
      return {};
    }
    const sourceCode = context.getSourceCode();
    return {
      JSONUnaryExpression(node: AST.JSONUnaryExpression) {
        if (node.operator === "+") {
          const operator = sourceCode.getFirstToken(
            node as any,
            (token) =>
              token.type === "Punctuator" && token.value === node.operator
          );
          context.report({
            loc: operator?.loc || node.loc,
            messageId: "disallow",
            fix(fixer) {
              return operator ? fixer.removeRange(operator.range) : null;
            },
          });
        }
      },
    };
  },
});
