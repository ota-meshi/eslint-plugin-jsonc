import type { Rule } from "eslint";
import type { AST } from "jsonc-eslint-parser";
import { isNumberIdentifier } from "jsonc-eslint-parser";
import { createRule } from "../utils/index.ts";

const nonDecimalNumericLiteralPattern = /^0[\dbox]/iu;

/**
 * Checks if the given string is valid number as JSON.
 */
function isValidNumber(text: string): boolean {
  try {
    JSON.parse(text);
  } catch {
    return false;
  }
  return true;
}

export default createRule("valid-json-number", {
  meta: {
    docs: {
      description: "disallow invalid number for JSON",
      recommended: ["json", "jsonc"],
      extensionRule: false,
      layout: false,
    },
    fixable: "code",
    schema: [],
    messages: {
      invalid: "Invalid number for JSON.",
      invalidSpace: "Spaces after minus sign are not allowed in JSON.",
      invalidPlus: "Plus signs are not allowed in JSON.",
      invalidIdentifier: "`{{name}}` are not allowed in JSON.",
      invalidLeadingDecimalPoint:
        "Leading decimal point is not allowed in JSON.",
      invalidTrailingDecimalPoint:
        "Trailing decimal point is not allowed in JSON.",
      invalidHex: "Hexadecimal literals are not allowed in JSON.",
      invalidOctal: "Octal literals are not allowed in JSON.",
      invalidBinary: "Binary literals are not allowed in JSON.",
    },
    type: "problem",
  },
  create(context) {
    const sourceCode = context.sourceCode;
    if (!sourceCode.parserServices.isJSON) {
      return {};
    }
    return {
      JSONUnaryExpression(node) {
        if (node.argument.type === "JSONIdentifier") {
          return;
        }
        const operator = sourceCode.getFirstToken(
          node as any,
          (token) =>
            token.type === "Punctuator" && token.value === node.operator,
        );
        if (node.operator === "+") {
          context.report({
            loc: operator?.loc || node.loc,
            messageId: "invalidPlus",
            fix(fixer) {
              return operator ? fixer.removeRange(operator.range) : null;
            },
          });
        } else if (operator && operator.range[1] < node.argument.range[0]) {
          context.report({
            loc: {
              start: operator.loc.end,
              end: node.argument.loc.start,
            },
            messageId: "invalidSpace",
            fix(fixer) {
              return fixer.removeRange([
                operator.range[1],
                node.argument.range[0],
              ]);
            },
          });
        }
      },
      JSONLiteral(node) {
        if (typeof node.value !== "number") {
          return;
        }
        const text = sourceCode.text.slice(...node.range);

        if (text.startsWith(".")) {
          context.report({
            loc: node.loc,
            messageId: "invalidLeadingDecimalPoint",
            fix(fixer) {
              return fixer.insertTextBeforeRange(node.range, "0");
            },
          });
          return;
        }
        if (text.endsWith(".")) {
          context.report({
            loc: node.loc,
            messageId: "invalidTrailingDecimalPoint",
            fix(fixer) {
              return fixer.removeRange([node.range[1] - 1, node.range[1]]);
            },
          });
          return;
        }
        if (nonDecimalNumericLiteralPattern.test(text)) {
          context.report({
            loc: node.loc,
            messageId:
              text[1].toLowerCase() === "x"
                ? "invalidHex"
                : text[1].toLowerCase() === "b"
                  ? "invalidBinary"
                  : "invalidOctal",
            fix: buildFix(node),
          });
          return;
        }
        if (!isValidNumber(text)) {
          context.report({
            loc: node.loc,
            messageId: "invalid",
            fix: buildFix(node),
          });
        }
      },
      JSONIdentifier(node) {
        if (!isNumberIdentifier(node)) {
          return;
        }
        context.report({
          loc: node.loc,
          messageId: "invalidIdentifier",
          data: {
            name: node.name,
          },
        });
      },
    };

    /**
     * Build fixer for number
     */
    function buildFix(
      node: AST.JSONLiteral,
    ): (fixer: Rule.RuleFixer) => Rule.Fix {
      return (fixer) => {
        return fixer.replaceTextRange(node.range, `${node.value}`);
      };
    }
  },
});
