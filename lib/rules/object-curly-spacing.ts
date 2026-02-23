// Most source code was copied from ESLint v8.
// MIT License. Copyright OpenJS Foundation and other contributors, <www.openjsf.org>
import type { AST } from "jsonc-eslint-parser";
import { createRule } from "../utils/index.ts";
import { isTokenOnSameLine } from "../utils/eslint-ast-utils.ts";
import {
  isClosingBraceToken,
  isClosingBracketToken,
  isCommentToken,
} from "@eslint-community/eslint-utils";
import type {
  JSONCComment,
  JSONCSourceCode,
  JSONCToken,
} from "../language/jsonc-source-code.ts";

export interface RuleOptions {
  arraysInObjects?: boolean;
  objectsInObjects?: boolean;
  emptyObjects?: "ignore" | "always" | "never";
}

/**
 * Parses the options for this rule and returns an object containing the spacing option,
 * the emptyObjects option, and two functions to determine if there should be spaces
 * after the opening curly brace and before the closing curly brace, based on the options and the surrounding tokens.
 * @param options The options passed to the rule.
 * @param sourceCode The source code object, used to get nodes by range index.
 * @returns An object containing the spacing option, the emptyObjects option, and two functions to determine if there should be spaces after the opening curly brace and before the closing curly brace.
 */
function parseOptions(
  options: [("always" | "never")?, RuleOptions?],
  sourceCode: JSONCSourceCode,
) {
  const spaced = options[0] ?? "never";

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
    return options[1] ? options[1][option] === (spaced === "never") : false;
  }

  const arraysInObjectsException = isOptionSet("arraysInObjects");
  const objectsInObjectsException = isOptionSet("objectsInObjects");
  const emptyObjects = options[1]?.emptyObjects ?? "ignore";

  /**
   * Determines if there should be a space after the opening curly brace,
   * based on the spacing option and the second token.
   * @param spaced The spacing option ("always" or "never").
   * @param second The second token after the opening curly brace.
   * @returns Whether or not there should be a space after the opening curly brace.
   */
  function isOpeningCurlyBraceMustBeSpaced(
    spaced: "always" | "never",
    _second: JSONCToken | JSONCComment,
  ) {
    return spaced === "always";
  }

  /**
   * Determines if there should be a space before the closing curly brace,
   * based on the spacing option and the penultimate token.
   * @param spaced The spacing option ("always" or "never").
   * @param penultimate The penultimate token before the closing curly brace.
   * @returns Whether or not there should be a space before the closing curly brace.
   */
  function isClosingCurlyBraceMustBeSpaced(
    spaced: "always" | "never",
    penultimate: JSONCToken | JSONCComment,
  ) {
    const targetPenultimateType =
      arraysInObjectsException && isClosingBracketToken(penultimate)
        ? "JSONArrayExpression"
        : objectsInObjectsException && isClosingBraceToken(penultimate)
          ? "JSONObjectExpression"
          : null;
    const node = sourceCode.getNodeByRangeIndex(penultimate.range[0]);

    return targetPenultimateType && node?.type === targetPenultimateType
      ? spaced === "never"
      : spaced === "always";
  }

  return {
    spaced,
    emptyObjects,
    isOpeningCurlyBraceMustBeSpaced,
    isClosingCurlyBraceMustBeSpaced,
  };
}

export default createRule<["always" | "never", RuleOptions]>(
  "object-curly-spacing",
  {
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
            emptyObjects: {
              type: "string",
              enum: ["ignore", "always", "never"],
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
        requiredSpaceInEmptyObject: "A space is required in empty object.",
        unexpectedSpaceInEmptyObject:
          "There should be no space in empty object.",
      },
    },
    create(context) {
      const sourceCode = context.sourceCode;
      if (!sourceCode.parserServices.isJSON) {
        return {};
      }

      const options = parseOptions(context.options, sourceCode);

      /**
       * Reports that there shouldn't be a space after the first token
       * @param node The node to report in the event of an error.
       * @param token The token to use for the report.
       */
      function reportNoBeginningSpace(
        node: AST.JSONObjectExpression,
        token: JSONCToken,
      ) {
        const nextToken = sourceCode.getTokenAfter(token, {
          includeComments: true,
        })!;

        context.report({
          node,
          loc: { start: token.loc.end, end: nextToken.loc.start },
          messageId: "unexpectedSpaceAfter",
          data: {
            token: token.value,
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
      function reportNoEndingSpace(
        node: AST.JSONObjectExpression,
        token: JSONCToken,
      ) {
        const previousToken = sourceCode.getTokenBefore(token, {
          includeComments: true,
        })!;

        context.report({
          node,
          loc: { start: previousToken.loc.end, end: token.loc.start },
          messageId: "unexpectedSpaceBefore",
          data: {
            token: token.value,
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
      function reportRequiredBeginningSpace(
        node: AST.JSONObjectExpression,
        token: JSONCToken,
      ) {
        context.report({
          node,
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
        token: JSONCToken,
      ) {
        context.report({
          node,
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
        spaced: "always" | "never",
        openingToken: JSONCToken,
        second: JSONCToken | JSONCComment,
        penultimate: JSONCToken | JSONCComment,
        closingToken: JSONCToken,
      ) {
        if (isTokenOnSameLine(openingToken, second)) {
          const firstSpaced = sourceCode.isSpaceBetween(openingToken, second);

          if (options.isOpeningCurlyBraceMustBeSpaced(spaced, second)) {
            if (!firstSpaced) reportRequiredBeginningSpace(node, openingToken);
          } else {
            if (firstSpaced && second.type !== "Line") {
              reportNoBeginningSpace(node, openingToken);
            }
          }
        }

        if (isTokenOnSameLine(penultimate, closingToken)) {
          const lastSpaced = sourceCode.isSpaceBetween(
            penultimate,
            closingToken,
          );

          if (options.isClosingCurlyBraceMustBeSpaced(spaced, penultimate)) {
            if (!lastSpaced) reportRequiredEndingSpace(node, closingToken);
          } else {
            if (lastSpaced) reportNoEndingSpace(node, closingToken);
          }
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

        return sourceCode.getTokenAfter(lastProperty, isClosingBraceToken);
      }

      /**
       * Checks spacing in empty objects. Depending on the options, reports
       * if there is an unexpected space or if there is no space when there should be.
       * @param node The node to check.
       */
      function checkSpaceInEmptyObject(node: AST.JSONObjectExpression) {
        if (options.emptyObjects === "ignore") {
          return;
        }

        const openingToken = sourceCode.getFirstToken(node);
        const closingToken = sourceCode.getLastToken(node);

        const second = sourceCode.getTokenAfter(openingToken, {
          includeComments: true,
        })!;
        if (second !== closingToken && isCommentToken(second)) {
          // If there is a comment in an empty object,
          // spacing is determined by the presence of spaces between the comment and the braces.
          const penultimate = sourceCode.getTokenBefore(closingToken, {
            includeComments: true,
          })!;
          validateBraceSpacing(
            node,
            options.emptyObjects,
            openingToken,
            second,
            penultimate,
            closingToken,
          );
          return;
        }
        const sourceBetween = sourceCode.text.slice(
          openingToken.range[1],
          closingToken.range[0],
        );
        if (sourceBetween.trim() !== "") {
          // It's in an unknown state, so ignore it.
          // This means there is some non-space content between the braces,
          // which shouldn't be the case for an empty object.
          // But we won't report an error here because it's not clear what the correct behavior should be.
          return;
        }

        if (options.emptyObjects === "always") {
          if (sourceBetween) return;
          context.report({
            node,
            loc: { start: openingToken.loc.end, end: closingToken.loc.start },
            messageId: "requiredSpaceInEmptyObject",
            fix(fixer) {
              return fixer.replaceTextRange(
                [openingToken.range[1], closingToken.range[0]],
                " ",
              );
            },
          });
        } else if (options.emptyObjects === "never") {
          if (!sourceBetween) return;
          context.report({
            node,
            loc: { start: openingToken.loc.end, end: closingToken.loc.start },
            messageId: "unexpectedSpaceInEmptyObject",
            fix(fixer) {
              return fixer.removeRange([
                openingToken.range[1],
                closingToken.range[0],
              ]);
            },
          });
        }
      }

      /**
       * Reports a given object node if spacing in curly braces is invalid.
       * @param node An ObjectExpression or ObjectPattern node to check.
       */
      function checkForObject(node: AST.JSONObjectExpression) {
        if (node.properties.length === 0) {
          checkSpaceInEmptyObject(node);
          return;
        }

        const openingToken = sourceCode.getFirstToken(node);
        const closingToken = getClosingBraceOfObject(node)!;
        const second = sourceCode.getTokenAfter(openingToken, {
          includeComments: true,
        })!;
        const penultimate = sourceCode.getTokenBefore(closingToken, {
          includeComments: true,
        })!;

        validateBraceSpacing(
          node,
          options.spaced,
          openingToken,
          second,
          penultimate,
          closingToken,
        );
      }

      return {
        JSONObjectExpression: checkForObject,
      };
    },
  },
);
