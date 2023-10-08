import type { AST } from "jsonc-eslint-parser";
import { createRule } from "../utils";
import { getSourceCode } from "eslint-compat-utils";

const binaryNumericLiteralPattern = /^0[Bb]/u;

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
    const sourceCode = getSourceCode(context);
    if (!sourceCode.parserServices.isJSON) {
      return {};
    }
    return {
      JSONLiteral(node: AST.JSONLiteral) {
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
