import type { AST } from "jsonc-eslint-parser";
import { createRule } from "../utils";
import { getSourceCode } from "eslint-compat-utils";

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
    const sourceCode = getSourceCode(context);
    if (!sourceCode.parserServices.isJSON) {
      return {};
    }
    return {
      JSONLiteral(node: AST.JSONLiteral) {
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
