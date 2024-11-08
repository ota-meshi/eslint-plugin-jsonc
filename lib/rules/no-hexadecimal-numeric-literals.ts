import { createRule } from "../utils";

const hexadecimalNumericLiteralPattern = /^0x/iu;

export default createRule("no-hexadecimal-numeric-literals", {
  meta: {
    docs: {
      description: "disallow hexadecimal numeric literals",
      recommended: ["json", "jsonc"],
      extensionRule: false,
      layout: false,
    },
    fixable: "code",
    messages: {
      disallow: "Hexadecimal numeric literals should not be used.",
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
          hexadecimalNumericLiteralPattern.test(node.raw)
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
