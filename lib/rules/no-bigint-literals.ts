import type { AST } from "jsonc-eslint-parser";
import { createRule } from "../utils";

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
    if (!context.parserServices.isJSON) {
      return {};
    }
    return {
      JSONLiteral(node: AST.JSONLiteral) {
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
