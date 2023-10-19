import { createRule } from "../utils";
import { getSourceCode } from "eslint-compat-utils";

export default createRule("no-template-literals", {
  meta: {
    docs: {
      description: "disallow template literals",
      recommended: ["json", "jsonc", "json5"],
      extensionRule: false,
      layout: false,
    },
    fixable: "code",
    schema: [],
    messages: {
      unexpected: "The template literals are not allowed.",
    },
    type: "problem",
  },
  create(context) {
    const sourceCode = getSourceCode(context);
    if (!sourceCode.parserServices.isJSON) {
      return {};
    }
    return {
      JSONTemplateLiteral(node) {
        context.report({
          loc: node.loc,
          messageId: "unexpected",
          fix(fixer) {
            const s = node.quasis[0].value.cooked;
            return fixer.replaceTextRange(node.range, JSON.stringify(s));
          },
        });
      },
    };
  },
});
