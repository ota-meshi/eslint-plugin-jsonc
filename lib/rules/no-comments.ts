import { createRule } from "../utils/index.ts";

export default createRule("no-comments", {
  meta: {
    docs: {
      description: "disallow comments",
      recommended: ["json"],
      extensionRule: false,
      layout: false,
    },
    schema: [],
    messages: {
      unexpected: "Unexpected comment.",
    },
    type: "problem",
  },
  create(context) {
    const sourceCode = context.sourceCode;
    if (!sourceCode.parserServices.isJSON) {
      return {};
    }
    return {
      Program() {
        for (const comment of sourceCode.getAllComments()) {
          context.report({
            loc: comment.loc,
            messageId: "unexpected",
          });
        }
      },
    };
  },
});
