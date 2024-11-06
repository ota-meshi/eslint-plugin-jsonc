import { createRule, isJson } from "../utils";

export default createRule("no-bigint-literals", {
  meta: {
    docs: {
      description: "disallow BigInt literals",
      recommended: ["json", "jsonc", "json5"],
      extensionRule: false,
      layout: false,
    },
    schema: [],
    messages: {
      unexpected: "BigInt literals are not allowed.",
    },
    type: "problem",
  },
  create(context) {
    if (!isJson(context)) {
      return {};
    }
    return {
      JSONLiteral(node) {
        if (node.bigint != null) {
          context.report({
            loc: node.loc,
            messageId: "unexpected",
          });
        }
      },
    };
  },
});
