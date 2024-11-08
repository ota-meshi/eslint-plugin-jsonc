// Most source code was copied from ESLint v8.
// MIT License. Copyright OpenJS Foundation and other contributors, <www.openjsf.org>
import type { AST } from "jsonc-eslint-parser";
import { createRule } from "../utils";
import type { Token } from "../types";
import { canTokensBeAdjacent } from "../utils/eslint-ast-utils";

export default createRule("space-unary-ops", {
  meta: {
    docs: {
      description: "disallow spaces after unary operators",
      recommended: ["json", "jsonc", "json5"],
      extensionRule: true,
      layout: true,
    },
    fixable: "whitespace",
    type: "layout",
    schema: [
      {
        type: "object",
        properties: {
          words: {
            type: "boolean",
            default: true,
          },
          nonwords: {
            type: "boolean",
            default: false,
          },
          overrides: {
            type: "object",
            additionalProperties: {
              type: "boolean",
            },
          },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      unexpectedBefore:
        "Unexpected space before unary operator '{{operator}}'.",
      unexpectedAfter: "Unexpected space after unary operator '{{operator}}'.",
      operator: "Unary operator '{{operator}}' must be followed by whitespace.",
      beforeUnaryExpressions:
        "Space is required before unary expressions '{{token}}'.",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;
    if (!sourceCode.parserServices.isJSON) {
      return {};
    }
    const options = context.options[0] || { words: true, nonwords: false };

    /**
     * Checks if an override exists for a given operator.
     * @param operator Operator
     * @returns Whether or not an override has been provided for the operator
     */
    function overrideExistsForOperator(operator: string) {
      return (
        options.overrides &&
        Object.prototype.hasOwnProperty.call(options.overrides, operator)
      );
    }

    /**
     * Gets the value that the override was set to for this operator
     * @param operator Operator
     * @returns Whether or not an override enforces a space with this operator
     */
    function overrideEnforcesSpaces(operator: string) {
      return options.overrides?.[operator];
    }

    /**
     * Verifies UnaryExpression have spaces before or after the operator
     * @param node AST node
     * @param firstToken First token in the expression
     * @param secondToken Second token in the expression
     */
    function verifyNonWordsHaveSpaces(
      node: AST.JSONUnaryExpression,
      firstToken: Token,
      secondToken: Token,
    ) {
      if ("prefix" in node && node.prefix) {
        if (firstToken.range[1] === secondToken.range[0]) {
          context.report({
            node: node as any,
            messageId: "operator",
            data: {
              operator: firstToken.value,
            },
            fix(fixer) {
              return fixer.insertTextAfter(firstToken, " ");
            },
          });
        }
      } else {
        if (firstToken.range[1] === secondToken.range[0]) {
          context.report({
            node: node as any,
            messageId: "beforeUnaryExpressions",
            data: {
              token: secondToken.value,
            },
            fix(fixer) {
              return fixer.insertTextBefore(secondToken, " ");
            },
          });
        }
      }
    }

    /**
     * Verifies UnaryExpression don't have spaces before or after the operator
     * @param node AST node
     * @param firstToken First token in the expression
     * @param secondToken Second token in the expression
     */
    function verifyNonWordsDontHaveSpaces(
      node: AST.JSONUnaryExpression,
      firstToken: Token,
      secondToken: Token,
    ) {
      if ("prefix" in node && node.prefix) {
        if (secondToken.range[0] > firstToken.range[1]) {
          context.report({
            node: node as any,
            messageId: "unexpectedAfter",
            data: {
              operator: firstToken.value,
            },
            fix(fixer) {
              if (canTokensBeAdjacent(firstToken, secondToken))
                return fixer.removeRange([
                  firstToken.range[1],
                  secondToken.range[0],
                ]);

              return null;
            },
          });
        }
      } else {
        if (secondToken.range[0] > firstToken.range[1]) {
          context.report({
            node: node as any,
            messageId: "unexpectedBefore",
            data: {
              operator: secondToken.value,
            },
            fix(fixer) {
              return fixer.removeRange([
                firstToken.range[1],
                secondToken.range[0],
              ]);
            },
          });
        }
      }
    }

    /**
     * Verifies UnaryExpression satisfy spacing requirements
     * @param node AST node
     */
    function checkForSpaces(node: AST.JSONUnaryExpression) {
      const tokens = sourceCode.getFirstTokens(node as any, 2);
      const firstToken = tokens[0];
      const secondToken = tokens[1];

      const operator = tokens[0].value;

      if (overrideExistsForOperator(operator)) {
        if (overrideEnforcesSpaces(operator))
          verifyNonWordsHaveSpaces(node, firstToken, secondToken);
        else verifyNonWordsDontHaveSpaces(node, firstToken, secondToken);
      } else if (options.nonwords) {
        verifyNonWordsHaveSpaces(node, firstToken, secondToken);
      } else {
        verifyNonWordsDontHaveSpaces(node, firstToken, secondToken);
      }
    }

    return {
      JSONUnaryExpression: checkForSpaces,
    };
  },
});
