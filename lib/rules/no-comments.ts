import { getSourceCode } from "../utils/compat-momoa";
import { createRule, isJson } from "../utils";

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
    const sourceCode = getSourceCode(context);
    if (!isJson(context)) {
      return {};
    }
    return {
      Program() {
        for (const comment of sourceCode.getAllComments()) {
          context.report({
            loc: comment.loc!,
            messageId: "unexpected",
          });
        }
      },
    };
  },
});
