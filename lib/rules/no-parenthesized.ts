import type { Rule } from "eslint";
import { isParenthesized } from "eslint-utils";
import type { AST } from "jsonc-eslint-parser";
import { isExpression } from "jsonc-eslint-parser";
import { createRule } from "../utils";

export default createRule("no-parenthesized", {
  meta: {
    docs: {
      description: "disallow parentheses around the expression",
      recommended: ["json", "jsonc", "json5"],
      extensionRule: false,
      layout: false,
    },
    fixable: "code",
    hasSuggestions: false,
    schema: [],
    messages: {
      disallow: "Parentheses around expression should not be used.",
    },
    type: "problem",
  },
  create(context) {
    if (!context.parserServices.isJSON) {
      return {};
    }
    const sourceCode = context.getSourceCode();

    type ExpressionHandler = {
      [key in AST.JSONExpression["type"]]: (
        node: AST.JSONExpression & { type: key }
      ) => void;
    };

    const handlers: ExpressionHandler = {
      JSONArrayExpression: handler,
      JSONBinaryExpression: handler,
      JSONIdentifier: handler,
      JSONLiteral: handler,
      JSONObjectExpression: handler,
      JSONTemplateLiteral: handler,
      JSONUnaryExpression: handler,
    };

    return handlers;

    /** Expression handler */
    function handler(node: AST.JSONExpression) {
      if (!isExpression(node) || !isParenthesized(node, sourceCode)) {
        return;
      }

      const leftParen = sourceCode.getTokenBefore(node as never)!;
      const rightParen = sourceCode.getTokenAfter(node as never)!;

      context.report({
        loc: leftParen.loc,
        messageId: "disallow",
        fix,
      });
      context.report({
        loc: rightParen.loc,
        messageId: "disallow",
        fix,
      });

      /** Fix error */
      function fix(fixer: Rule.RuleFixer) {
        const parent = node.parent;
        if (!parent) {
          return [];
        }
        if (
          parent.type !== "JSONArrayExpression" &&
          parent.type !== "JSONExpressionStatement" &&
          parent.type !== "JSONProperty"
        ) {
          return [];
        }

        return [
          fixer.removeRange(leftParen.range),
          fixer.removeRange(rightParen.range),
        ];
      }
    }
  },
});
