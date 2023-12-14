// Most source code was copied from ESLint v8.
// MIT License. Copyright OpenJS Foundation and other contributors, <www.openjsf.org>
import type { AST } from "jsonc-eslint-parser";
import { createRule } from "../utils";
import { getSourceCode } from "eslint-compat-utils";
import { isTokenOnSameLine } from "../utils/eslint-ast-utils";
import type { Token } from "../types";

export default createRule("array-bracket-spacing", {
  meta: {
    docs: {
      description: "disallow or enforce spaces inside of brackets",
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
          singleValue: {
            type: "boolean",
          },
          objectsInArrays: {
            type: "boolean",
          },
          arraysInArrays: {
            type: "boolean",
          },
        },
        additionalProperties: false,
      },
    ],

    messages: {
      unexpectedSpaceAfter: "There should be no space after '{{tokenValue}}'.",
      unexpectedSpaceBefore:
        "There should be no space before '{{tokenValue}}'.",
      missingSpaceAfter: "A space is required after '{{tokenValue}}'.",
      missingSpaceBefore: "A space is required before '{{tokenValue}}'.",
    },
  },
  create(context) {
    const sourceCode = getSourceCode(context);
    if (!sourceCode.parserServices.isJSON) {
      return {};
    }
    const spaced = context.options[0] === "always";
    interface Schema1 {
      singleValue?: boolean;
      objectsInArrays?: boolean;
      arraysInArrays?: boolean;
    }

    /**
     * Determines whether an option is set, relative to the spacing option.
     * If spaced is "always", then check whether option is set to false.
     * If spaced is "never", then check whether option is set to true.
     * @param option The option to exclude.
     * @returns Whether or not the property is excluded.
     */
    function isOptionSet(option: keyof NonNullable<Schema1>) {
      return context.options[1]
        ? context.options[1][option] === !spaced
        : false;
    }

    const options = {
      spaced,
      singleElementException: isOptionSet("singleValue"),
      objectsInArraysException: isOptionSet("objectsInArrays"),
      arraysInArraysException: isOptionSet("arraysInArrays"),
      isOpeningBracketMustBeSpaced(node: AST.JSONArrayExpression) {
        if (options.singleElementException && node.elements.length === 1) {
          return !options.spaced;
        }
        const firstElement = node.elements[0];
        return firstElement &&
          ((options.objectsInArraysException && isObjectType(firstElement)) ||
            (options.arraysInArraysException && isArrayType(firstElement)))
          ? !options.spaced
          : options.spaced;
      },
      isClosingBracketMustBeSpaced(node: AST.JSONArrayExpression) {
        if (options.singleElementException && node.elements.length === 1) {
          return !options.spaced;
        }
        const lastElement = node.elements[node.elements.length - 1];
        return lastElement &&
          ((options.objectsInArraysException && isObjectType(lastElement)) ||
            (options.arraysInArraysException && isArrayType(lastElement)))
          ? !options.spaced
          : options.spaced;
      },
    };

    /**
     * Reports that there shouldn't be a space after the first token
     * @param node The node to report in the event of an error.
     * @param token The token to use for the report.
     */
    function reportNoBeginningSpace(node: AST.JSONNode, token: Token) {
      const nextToken = sourceCode.getTokenAfter(token)!;

      context.report({
        node: node as any,
        loc: { start: token.loc.end, end: nextToken.loc.start },
        messageId: "unexpectedSpaceAfter",
        data: {
          tokenValue: token.value,
        },
        fix(fixer) {
          return fixer.removeRange([token.range[1], nextToken.range[0]]);
        },
      });
    }

    /**
     * Reports that there shouldn't be a space before the last token
     * @param node The node to report in the event of an error.
     * @param token The token to use for the report.
     */
    function reportNoEndingSpace(node: AST.JSONNode, token: Token) {
      const previousToken = sourceCode.getTokenBefore(token)!;

      context.report({
        node: node as any,
        loc: { start: previousToken.loc.end, end: token.loc.start },
        messageId: "unexpectedSpaceBefore",
        data: {
          tokenValue: token.value,
        },
        fix(fixer) {
          return fixer.removeRange([previousToken.range[1], token.range[0]]);
        },
      });
    }

    /**
     * Reports that there should be a space after the first token
     * @param node The node to report in the event of an error.
     * @param token The token to use for the report.
     */
    function reportRequiredBeginningSpace(node: AST.JSONNode, token: Token) {
      context.report({
        node: node as any,
        loc: token.loc,
        messageId: "missingSpaceAfter",
        data: {
          tokenValue: token.value,
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
    function reportRequiredEndingSpace(node: AST.JSONNode, token: Token) {
      context.report({
        node: node as any,
        loc: token.loc,
        messageId: "missingSpaceBefore",
        data: {
          tokenValue: token.value,
        },
        fix(fixer) {
          return fixer.insertTextBefore(token, " ");
        },
      });
    }

    /**
     * Determines if a node is an object type
     * @param node The node to check.
     * @returns Whether or not the node is an object type.
     */
    function isObjectType(node: AST.JSONNode) {
      return node && node.type === "JSONObjectExpression";
    }

    /**
     * Determines if a node is an array type
     * @param node The node to check.
     * @returns Whether or not the node is an array type.
     */
    function isArrayType(node: AST.JSONNode) {
      return node && node.type === "JSONArrayExpression";
    }

    /**
     * Validates the spacing around array brackets
     * @param node The node we're checking for spacing
     */
    function validateArraySpacing(node: AST.JSONArrayExpression) {
      if (options.spaced && node.elements.length === 0) return;

      const first = sourceCode.getFirstToken(node as any)!;
      const second = sourceCode.getFirstToken(node as any, 1)!;
      const last = sourceCode.getLastToken(node as any)!;
      const penultimate = sourceCode.getTokenBefore(last)!;

      if (isTokenOnSameLine(first, second)) {
        if (options.isOpeningBracketMustBeSpaced(node)) {
          if (!sourceCode.isSpaceBetween(first, second))
            reportRequiredBeginningSpace(node, first);
        } else {
          if (sourceCode.isSpaceBetween(first, second))
            reportNoBeginningSpace(node, first);
        }
      }

      if (first !== penultimate && isTokenOnSameLine(penultimate, last)) {
        if (options.isClosingBracketMustBeSpaced(node)) {
          if (!sourceCode.isSpaceBetween(penultimate, last))
            reportRequiredEndingSpace(node, last);
        } else {
          if (sourceCode.isSpaceBetween(penultimate, last))
            reportNoEndingSpace(node, last);
        }
      }
    }

    return {
      JSONArrayExpression: validateArraySpacing,
    };
  },
});
