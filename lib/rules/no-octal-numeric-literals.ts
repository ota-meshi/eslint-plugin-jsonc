import { createRule, isJson } from "../utils";

const octalNumericLiteralPattern = /^0o/iu;

export default createRule("no-octal-numeric-literals", {
  meta: {
    docs: {
      description: "disallow octal numeric literals",
      recommended: ["json", "jsonc", "json5"],
      extensionRule: false,
      layout: false,
    },
    fixable: "code",
    messages: {
      disallow: "Octal numeric literals should not be used.",
    },
    schema: [],
    type: "problem",
  },
  create(context) {
    if (!isJson(context)) {
      return {};
    }
    return {
      JSONLiteral(node) {
        if (
          typeof node.value === "number" &&
          octalNumericLiteralPattern.test(node.raw)
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
