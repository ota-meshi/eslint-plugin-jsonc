import { createRule } from "../utils";
import { getSourceCode } from "eslint-compat-utils";

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
    const sourceCode = getSourceCode(context);
    if (!sourceCode.parserServices.isJSON) {
      return {};
    }
    return {
      JSONLiteral(node) {
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
