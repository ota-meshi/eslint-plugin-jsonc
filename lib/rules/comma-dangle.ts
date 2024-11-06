// Most source code was copied from ESLint v8.
// MIT License. Copyright OpenJS Foundation and other contributors, <www.openjsf.org>
import type { AST } from "jsonc-eslint-parser";
import { createRule, isJson } from "../utils";
import { getSourceCode } from "../utils/compat-momoa";
import { isCommaToken } from "@eslint-community/eslint-utils";
import { getNextLocation } from "../utils/eslint-ast-utils";

type Value = "always-multiline" | "always" | "never" | "only-multiline";
const DEFAULT_OPTIONS = Object.freeze({
  arrays: "never",
  objects: "never",
});

const closeBraces = ["}", "]", ")", ">"];

/**
 * Normalize option value.
 * @param optionValue The 1st option value to normalize.
 * @param ecmaVersion The normalized ECMAScript version.
 * @returns The normalized option value.
 */
function normalizeOptions(optionValue: any) {
  if (typeof optionValue === "string") {
    return {
      arrays: optionValue,
      objects: optionValue,
    };
  }
  if (typeof optionValue === "object" && optionValue !== null) {
    return {
      arrays: optionValue.arrays || DEFAULT_OPTIONS.arrays,
      objects: optionValue.objects || DEFAULT_OPTIONS.objects,
    };
  }

  return DEFAULT_OPTIONS;
}

export default createRule("comma-dangle", {
  meta: {
    docs: {
      description: "require or disallow trailing commas",
      recommended: ["json"],
      extensionRule: true,
      layout: true,
    },
    type: "layout",

    fixable: "code",

    schema: {
      definitions: {
        value: {
          type: "string",
          enum: ["always-multiline", "always", "never", "only-multiline"],
        },
        valueWithIgnore: {
          type: "string",
          enum: [
            "always-multiline",
            "always",
            "ignore",
            "never",
            "only-multiline",
          ],
        },
      },
      type: "array",
      items: [
        {
          oneOf: [
            {
              $ref: "#/definitions/value",
            },
            {
              type: "object",
              properties: {
                arrays: { $ref: "#/definitions/valueWithIgnore" },
                objects: { $ref: "#/definitions/valueWithIgnore" },
                imports: { $ref: "#/definitions/valueWithIgnore" },
                exports: { $ref: "#/definitions/valueWithIgnore" },
                functions: { $ref: "#/definitions/valueWithIgnore" },
              },
              additionalProperties: false,
            },
          ],
        },
      ],
      additionalItems: false,
    },

    messages: {
      unexpected: "Unexpected trailing comma.",
      missing: "Missing trailing comma.",
    },
  },
  create(context) {
    const sourceCode = getSourceCode(context);
    if (!isJson(context)) {
      return {};
    }
    const options = normalizeOptions(context.options[0] || "never");

    /**
     * Gets the last item of the given node.
     * @param node The node to get.
     * @returns The last node or null.
     */
    function getLastItem(node: AST.JSONNode): AST.JSONNode | null {
      /**
       * Returns the last element of an array
       * @param array The input array
       * @returns The last element
       */
      function last(array: (AST.JSONNode | null)[]): AST.JSONNode | null {
        return array[array.length - 1];
      }

      switch (node.type) {
        case "JSONObjectExpression":
          return last(node.properties);
        case "JSONArrayExpression":
          return last(node.elements);
        default:
          return null;
      }
    }

    /**
     * Gets the trailing comma token of the given node.
     * If the trailing comma does not exist, this returns the token which is
     * the insertion point of the trailing comma token.
     * @param node The node to get.
     * @param lastItem The last item of the node.
     * @returns The trailing comma token or the insertion point.
     */
    function getTrailingToken(node: AST.JSONNode, lastItem: AST.JSONNode) {
      switch (node.type) {
        case "JSONObjectExpression":
        case "JSONArrayExpression":
          return sourceCode.getLastToken(node as any, 1);
        default: {
          const nextToken = sourceCode.getTokenAfter(lastItem as any)!;

          if (isCommaToken(nextToken)) return nextToken;

          return sourceCode.getLastToken(lastItem as any);
        }
      }
    }

    /**
     * Checks whether or not a given node is multiline.
     * This rule handles a given node as multiline when the closing parenthesis
     * and the last element are not on the same line.
     * @param node A node to check.
     * @returns `true` if the node is multiline.
     */
    function isMultiline(node: AST.JSONNode) {
      const lastItem = getLastItem(node);

      if (!lastItem) return false;

      const penultimateToken = getTrailingToken(node, lastItem);
      if (!penultimateToken) return false;
      const lastToken = sourceCode.getTokenAfter(penultimateToken);
      if (!lastToken) return false;

      return lastToken.loc.end.line !== penultimateToken.loc.end.line;
    }

    /**
     * Reports a trailing comma if it exists.
     * @param node A node to check. Its type is one of
     *   ObjectExpression, ObjectPattern, ArrayExpression, ArrayPattern,
     *   ImportDeclaration, and ExportNamedDeclaration.
     */
    function forbidTrailingComma(node: AST.JSONNode) {
      const lastItem = getLastItem(node);

      if (!lastItem) return;

      const trailingToken = getTrailingToken(node, lastItem);

      if (trailingToken && isCommaToken(trailingToken)) {
        context.report({
          node: lastItem as any,
          loc: trailingToken.loc,
          messageId: "unexpected",
          *fix(fixer) {
            yield fixer.remove(trailingToken);

            /**
             * Extend the range of the fix to include surrounding tokens to ensure
             * that the element after which the comma is removed stays _last_.
             * This intentionally makes conflicts in fix ranges with rules that may be
             * adding or removing elements in the same autofix pass.
             * https://github.com/eslint/eslint/issues/15660
             */
            yield fixer.insertTextBefore(
              sourceCode.getTokenBefore(trailingToken)!,
              "",
            );
            yield fixer.insertTextAfter(
              sourceCode.getTokenAfter(trailingToken)!,
              "",
            );
          },
        });
      }
    }

    /**
     * Reports the last element of a given node if it does not have a trailing
     * comma.
     *
     * If a given node is `ArrayPattern` which has `RestElement`, the trailing
     * comma is disallowed, so report if it exists.
     * @param node A node to check. Its type is one of
     *   ObjectExpression, ObjectPattern, ArrayExpression, ArrayPattern,
     *   ImportDeclaration, and ExportNamedDeclaration.
     */
    function forceTrailingComma(node: AST.JSONNode) {
      const lastItem = getLastItem(node);

      if (!lastItem) return;

      const trailingToken = getTrailingToken(node, lastItem);

      if (!trailingToken || trailingToken.value === ",") return;

      const nextToken = sourceCode.getTokenAfter(trailingToken);
      if (!nextToken || !closeBraces.includes(nextToken.value)) return;

      context.report({
        node: lastItem as any,
        loc: {
          start: trailingToken.loc.end,
          end: getNextLocation(sourceCode, trailingToken.loc.end)!,
        },
        messageId: "missing",
        *fix(fixer) {
          yield fixer.insertTextAfter(trailingToken, ",");

          /**
           * Extend the range of the fix to include surrounding tokens to ensure
           * that the element after which the comma is inserted stays _last_.
           * This intentionally makes conflicts in fix ranges with rules that may be
           * adding or removing elements in the same autofix pass.
           * https://github.com/eslint/eslint/issues/15660
           */
          yield fixer.insertTextBefore(trailingToken, "");
          yield fixer.insertTextAfter(
            sourceCode.getTokenAfter(trailingToken)!,
            "",
          );
        },
      });
    }

    /**
     * If a given node is multiline, reports the last element of a given node
     * when it does not have a trailing comma.
     * Otherwise, reports a trailing comma if it exists.
     * @param node A node to check. Its type is one of
     *   ObjectExpression, ObjectPattern, ArrayExpression, ArrayPattern,
     *   ImportDeclaration, and ExportNamedDeclaration.
     */
    function forceTrailingCommaIfMultiline(node: AST.JSONNode) {
      if (isMultiline(node)) forceTrailingComma(node);
      else forbidTrailingComma(node);
    }

    /**
     * Only if a given node is not multiline, reports the last element of a given node
     * when it does not have a trailing comma.
     * Otherwise, reports a trailing comma if it exists.
     * @param node A node to check. Its type is one of
     *   ObjectExpression, ObjectPattern, ArrayExpression, ArrayPattern,
     *   ImportDeclaration, and ExportNamedDeclaration.
     */
    function allowTrailingCommaIfMultiline(node: AST.JSONNode) {
      if (!isMultiline(node)) forbidTrailingComma(node);
    }

    const predicate: Record<
      Value | "ignore" | string,
      (node: AST.JSONNode) => void
    > = {
      always: forceTrailingComma,
      "always-multiline": forceTrailingCommaIfMultiline,
      "only-multiline": allowTrailingCommaIfMultiline,
      never: forbidTrailingComma,
      ignore() {
        // noop
      },
    };

    return {
      JSONObjectExpression: predicate[options.objects],
      JSONArrayExpression: predicate[options.arrays],
    };
  },
});
