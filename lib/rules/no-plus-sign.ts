import { createRule } from "../utils/index.ts";

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
    const sourceCode = context.sourceCode;
    if (!sourceCode.parserServices.isJSON) {
      return {};
    }
    return {
      JSONUnaryExpression(node) {
        if (node.operator === "+") {
          const operator = sourceCode.getFirstToken(
            node,
            (token) =>
              token.type === "Punctuator" && token.value === node.operator,
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
