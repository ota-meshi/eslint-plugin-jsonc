import { createRule } from "../utils/index.ts";

const binaryNumericLiteralPattern = /^0b/iu;

export default createRule("no-binary-numeric-literals", {
  meta: {
    docs: {
      description: "disallow binary numeric literals",
      recommended: ["json", "jsonc", "json5"],
      extensionRule: false,
      layout: false,
    },
    fixable: "code",
    messages: {
      disallow: "Binary numeric literals should not be used.",
    },
    schema: [],
    type: "problem",
  },
  create(context) {
    if (!context.sourceCode.parserServices.isJSON) {
      return {};
    }
    return {
      JSONLiteral(node) {
        if (
          typeof node.value === "number" &&
          binaryNumericLiteralPattern.test(node.raw)
        ) {
          context.report({
            loc: node.loc,
            messageId: "disallow",
            fix: (fixer) => {
              return fixer.replaceTextRange(node.range, `${node.value}`);
            },
          });
        }
      },
    };
  },
});
