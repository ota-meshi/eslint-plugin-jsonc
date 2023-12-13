// Most source code was copied from ESLint v8.
// MIT License. Copyright OpenJS Foundation and other contributors, <www.openjsf.org>
import type { AST } from "jsonc-eslint-parser";
import { createRule } from "../utils";
import { getSourceCode } from "eslint-compat-utils";
import type { Comment, Token } from "../types";
import { isTokenOnSameLine } from "../utils/eslint-ast-utils";
import {
  isClosingBraceToken,
  isClosingBracketToken,
} from "@eslint-community/eslint-utils";

export default createRule("object-curly-spacing", {
  meta: {
    docs: {
      description: "enforce consistent spacing inside braces",
      recommended: null,
      extensionRule: true,
      layout: true,
    },
    type: "layout",

    fixable: "whitespace",

    schema: [
      {
        type: "string",
        enum: ["always", "never"],
      },
      {
        type: "object",
        properties: {
          arraysInObjects: {
            type: "boolean",
          },
          objectsInObjects: {
            type: "boolean",
          },
        },
        additionalProperties: false,
      },
    ],

    messages: {
      requireSpaceBefore: "A space is required before '{{token}}'.",
      requireSpaceAfter: "A space is required after '{{token}}'.",
      unexpectedSpaceBefore: "There should be no space before '{{token}}'.",
      unexpectedSpaceAfter: "There should be no space after '{{token}}'.",
    },
  },
  create(context) {
    const spaced = context.options[0] === "always";
    const sourceCode = getSourceCode(context);

    /**
     * Determines whether an option is set, relative to the spacing option.
     * If spaced is "always", then check whether option is set to false.
     * If spaced is "never", then check whether option is set to true.
     * @param option The option to exclude.
     * @returns Whether or not the property is excluded.
     */
    function isOptionSet(
      option: "arraysInObjects" | "objectsInObjects",
    ): boolean {
      return context.options[1]
        ? context.options[1][option] === !spaced
        : false;
    }

    const options = {
      spaced,
      arraysInObjectsException: isOptionSet("arraysInObjects"),
      objectsInObjectsException: isOptionSet("objectsInObjects"),
    };

    /**
     * Reports that there shouldn't be a space after the first token
     * @param node The node to report in the event of an error.
     * @param token The token to use for the report.
     */
    function reportNoBeginningSpace(
      node: AST.JSONObjectExpression,
      token: Token,
    ) {
      const nextToken = sourceCode.getTokenAfter(token, {
        includeComments: true,
      })!;

      context.report({
        node: node as any,
        loc: { start: token.loc.end, end: nextToken.loc!.start },
        messageId: "unexpectedSpaceAfter",
        data: {
          token: token.value,
        },
        fix(fixer) {
          return fixer.removeRange([token.range[1], nextToken.range![0]]);
        },
      });
    }

    /**
     * Reports that there shouldn't be a space before the last token
     * @param node The node to report in the event of an error.
     * @param token The token to use for the report.
     */
    function reportNoEndingSpace(node: AST.JSONObjectExpression, token: Token) {
      const previousToken = sourceCode.getTokenBefore(token, {
        includeComments: true,
      })!;

      context.report({
        node: node as any,
        loc: { start: previousToken.loc!.end, end: token.loc.start },
        messageId: "unexpectedSpaceBefore",
        data: {
          token: token.value,
        },
        fix(fixer) {
          return fixer.removeRange([previousToken.range![1], token.range[0]]);
        },
      });
    }

    /**
     * Reports that there should be a space after the first token
     * @param node The node to report in the event of an error.
     * @param token The token to use for the report.
     */
    function reportRequiredBeginningSpace(
      node: AST.JSONObjectExpression,
      token: Token,
    ) {
      context.report({
        node: node as any,
        loc: token.loc,
        messageId: "requireSpaceAfter",
        data: {
          token: token.value,
        },
        fix(fixer) {
          return fixer.insertTextAfter(token, " ");
        },
      });
    }

    /**
     * Reports that there should be a space before the last token
     * @param node The node to report in the event of an error.
     * @param token The token to use for the report.
     */
    function reportRequiredEndingSpace(
      node: AST.JSONObjectExpression,
      token: Token,
    ) {
      context.report({
        node: node as any,
        loc: token.loc,
        messageId: "requireSpaceBefore",
        data: {
          token: token.value,
        },
        fix(fixer) {
          return fixer.insertTextBefore(token, " ");
        },
      });
    }

    /**
     * Determines if spacing in curly braces is valid.
     * @param node The AST node to check.
     * @param first The first token to check (should be the opening brace)
     * @param second The second token to check (should be first after the opening brace)
     * @param penultimate The penultimate token to check (should be last before closing brace)
     * @param last The last token to check (should be closing brace)
     */
    function validateBraceSpacing(
      node: AST.JSONObjectExpression,
      first: Token,
      second: Token | Comment,
      penultimate: Token | Comment,
      last: Token,
    ) {
      if (isTokenOnSameLine(first, second)) {
        const firstSpaced = sourceCode.isSpaceBetweenTokens(
          first,
          second as Token,
        );

        if (options.spaced && !firstSpaced)
          reportRequiredBeginningSpace(node, first);

        if (!options.spaced && firstSpaced && second.type !== "Line")
          reportNoBeginningSpace(node, first);
      }

      if (isTokenOnSameLine(penultimate, last)) {
        const shouldCheckPenultimate =
          (options.arraysInObjectsException &&
            isClosingBracketToken(penultimate)) ||
          (options.objectsInObjectsException &&
            isClosingBraceToken(penultimate));
        const penultimateType =
          shouldCheckPenultimate &&
          sourceCode.getNodeByRangeIndex(penultimate.range[0])!.type;

        const closingCurlyBraceMustBeSpaced =
          (options.arraysInObjectsException &&
            penultimateType === "ArrayExpression") ||
          (options.objectsInObjectsException &&
            (penultimateType === "ObjectExpression" ||
              penultimateType === "ObjectPattern"))
            ? !options.spaced
            : options.spaced;

        const lastSpaced = sourceCode.isSpaceBetweenTokens(
          penultimate as Token,
          last,
        );

        if (closingCurlyBraceMustBeSpaced && !lastSpaced)
          reportRequiredEndingSpace(node, last);

        if (!closingCurlyBraceMustBeSpaced && lastSpaced)
          reportNoEndingSpace(node, last);
      }
    }

    /**
     * Gets '}' token of an object node.
     *
     * Because the last token of object patterns might be a type annotation,
     * this traverses tokens preceded by the last property, then returns the
     * first '}' token.
     * @param node The node to get. This node is an
     *      ObjectExpression or an ObjectPattern. And this node has one or
     *      more properties.
     * @returns '}' token.
     */
    function getClosingBraceOfObject(node: AST.JSONObjectExpression) {
      const lastProperty = node.properties[node.properties.length - 1];

      return sourceCode.getTokenAfter(lastProperty as any, isClosingBraceToken);
    }

    /**
     * Reports a given object node if spacing in curly braces is invalid.
     * @param node An ObjectExpression or ObjectPattern node to check.
     */
    function checkForObject(node: AST.JSONObjectExpression) {
      if (node.properties.length === 0) return;

      const first = sourceCode.getFirstToken(node as any)!;
      const last = getClosingBraceOfObject(node)!;
      const second = sourceCode.getTokenAfter(first, {
        includeComments: true,
      })!;
      const penultimate = sourceCode.getTokenBefore(last, {
        includeComments: true,
      })!;

      validateBraceSpacing(node, first, second, penultimate, last);
    }

    return {
      JSONObjectExpression: checkForObject,
    };
  },
});
