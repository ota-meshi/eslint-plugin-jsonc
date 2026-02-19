import { createRule } from "../utils/index.ts";

export default createRule("no-regexp-literals", {
  meta: {
    docs: {
      description: "disallow RegExp literals",
      recommended: ["json", "jsonc", "json5"],
      extensionRule: false,
      layout: false,
    },
    schema: [],
    messages: {
      unexpected: "RegExp literals are not allowed.",
    },
    type: "problem",
  },
  create(context) {
    if (!context.sourceCode.parserServices.isJSON) {
      return {};
    }
    return {
      JSONLiteral(node) {
        if (node.regex) {
          context.report({
            loc: node.loc,
            messageId: "unexpected",
          });
        }
      },
    };
  },
});
