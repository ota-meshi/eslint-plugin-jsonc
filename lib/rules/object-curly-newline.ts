// Most source code was copied from ESLint v8.
// MIT License. Copyright OpenJS Foundation and other contributors, <www.openjsf.org>
import type { AST } from "jsonc-eslint-parser";
import { createRule } from "../utils/index.ts";
import type { JSONSchema4 } from "json-schema";
import {
  isClosingBraceToken,
  isCommentToken,
  isOpeningBraceToken,
} from "@eslint-community/eslint-utils";
import { isTokenOnSameLine } from "../utils/eslint-ast-utils.ts";
import type {
  JSONCComment,
  JSONCToken,
} from "../language/jsonc-source-code.ts";

// Schema objects.
const OPTION_VALUE: JSONSchema4 = {
  oneOf: [
    {
      type: "string",
      enum: ["always", "never"],
    },
    {
      type: "object",
      properties: {
        multiline: {
          type: "boolean",
        },
        minProperties: {
          type: "integer",
          minimum: 0,
        },
        consistent: {
          type: "boolean",
        },
      },
      additionalProperties: false,
      minProperties: 1,
    },
  ],
};

/**
 * Normalizes a given option value.
 * @param value An option value to parse.
 * @returns Normalized option object.
 */
function normalizeOptionValue(value: any) {
  let multiline = false;
  let minProperties = Number.POSITIVE_INFINITY;
  let consistent = false;

  if (value) {
    if (value === "always") {
      minProperties = 0;
    } else if (value === "never") {
      minProperties = Number.POSITIVE_INFINITY;
    } else {
      multiline = Boolean(value.multiline);
      minProperties = value.minProperties || Number.POSITIVE_INFINITY;
      consistent = Boolean(value.consistent);
    }
  } else {
    consistent = true;
  }

  return { multiline, minProperties, consistent };
}

/**
 * Checks if a value is an object.
 * @param value The value to check
 * @returns `true` if the value is an object, otherwise `false`
 */
function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Checks if an option is a node-specific option
 * @param option The option to check
 * @returns `true` if the option is node-specific, otherwise `false`
 */
function isNodeSpecificOption(option: unknown) {
  return isObject(option) || typeof option === "string";
}

/**
 * Normalizes a given option value.
 * @param options An option value to parse.
 * @returns {{
 *   ObjectExpression: {multiline: boolean, minProperties: number, consistent: boolean},
 *   ObjectPattern: {multiline: boolean, minProperties: number, consistent: boolean},
 *   ImportDeclaration: {multiline: boolean, minProperties: number, consistent: boolean},
 *   ExportNamedDeclaration : {multiline: boolean, minProperties: number, consistent: boolean}
 * }} Normalized option object.
 */
function normalizeOptions(options: any) {
  if (isObject(options) && Object.values(options).some(isNodeSpecificOption)) {
    return {
      JSONObjectExpression: normalizeOptionValue(options.ObjectExpression),
    };
  }

  const value = normalizeOptionValue(options);

  return {
    JSONObjectExpression: value,
  };
}

/**
 * Determines if ObjectExpression, ObjectPattern, ImportDeclaration or ExportNamedDeclaration
 * node needs to be checked for missing line breaks
 * @param node Node under inspection
 * @param options option specific to node type
 * @param first First object property
 * @param last Last object property
 * @returns `true` if node needs to be checked for missing line breaks
 */
function areLineBreaksRequired(
  node: AST.JSONObjectExpression,
  options: { multiline: boolean; minProperties: number; consistent: boolean },
  first: JSONCToken | JSONCComment,
  last: JSONCToken | JSONCComment,
) {
  const objectProperties = node.properties;

  return (
    objectProperties.length >= options.minProperties ||
    (options.multiline &&
      objectProperties.length > 0 &&
      first.loc.start.line !== last.loc.end.line)
  );
}

export default createRule("object-curly-newline", {
  meta: {
    docs: {
      description: "enforce consistent line breaks inside braces",
      recommended: null,
      extensionRule: true,
      layout: true,
    },
    type: "layout",

    fixable: "whitespace",

    schema: [
      {
        oneOf: [
          OPTION_VALUE,
          {
            type: "object",
            properties: {
              ObjectExpression: OPTION_VALUE,
              ObjectPattern: OPTION_VALUE,
              ImportDeclaration: OPTION_VALUE,
              ExportDeclaration: OPTION_VALUE,
            },
            additionalProperties: false,
            minProperties: 1,
          },
        ],
      },
    ],

    messages: {
      unexpectedLinebreakBeforeClosingBrace:
        "Unexpected line break before this closing brace.",
      unexpectedLinebreakAfterOpeningBrace:
        "Unexpected line break after this opening brace.",
      expectedLinebreakBeforeClosingBrace:
        "Expected a line break before this closing brace.",
      expectedLinebreakAfterOpeningBrace:
        "Expected a line break after this opening brace.",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;
    if (!sourceCode.parserServices.isJSON) {
      return {};
    }
    const normalizedOptions = normalizeOptions(context.options[0]);

    /**
     * Reports a given node if it violated this rule.
     * @param node A node to check. This is an ObjectExpression node.
     */
    function check(node: AST.JSONObjectExpression) {
      const options = normalizedOptions[node.type];

      const openBrace = sourceCode.getFirstToken(node, isOpeningBraceToken)!;
      const closeBrace = sourceCode.getLastToken(node, isClosingBraceToken)!;

      let first = sourceCode.getTokenAfter(openBrace, {
        includeComments: true,
      })!;
      let last = sourceCode.getTokenBefore(closeBrace, {
        includeComments: true,
      })!;

      const needsLineBreaks = areLineBreaksRequired(node, options, first, last);

      const hasCommentsFirstToken = isCommentToken(first);
      const hasCommentsLastToken = isCommentToken(last);

      /**
       * Use tokens or comments to check multiline or not.
       * But use only tokens to check whether line breaks are needed.
       * This allows:
       *     var obj = { // eslint-disable-line foo
       *         a: 1
       *     }
       */
      first = sourceCode.getTokenAfter(openBrace)!;
      last = sourceCode.getTokenBefore(closeBrace)!;

      if (needsLineBreaks) {
        if (isTokenOnSameLine(openBrace, first)) {
          context.report({
            messageId: "expectedLinebreakAfterOpeningBrace",
            node,
            loc: openBrace.loc,
            fix(fixer) {
              if (hasCommentsFirstToken) return null;

              return fixer.insertTextAfter(openBrace, "\n");
            },
          });
        }
        if (isTokenOnSameLine(last, closeBrace)) {
          context.report({
            messageId: "expectedLinebreakBeforeClosingBrace",
            node,
            loc: closeBrace.loc,
            fix(fixer) {
              if (hasCommentsLastToken) return null;

              return fixer.insertTextBefore(closeBrace, "\n");
            },
          });
        }
      } else {
        const consistent = options.consistent;
        const hasLineBreakBetweenOpenBraceAndFirst = !isTokenOnSameLine(
          openBrace,
          first,
        );
        const hasLineBreakBetweenCloseBraceAndLast = !isTokenOnSameLine(
          last,
          closeBrace,
        );

        if (
          (!consistent && hasLineBreakBetweenOpenBraceAndFirst) ||
          (consistent &&
            hasLineBreakBetweenOpenBraceAndFirst &&
            !hasLineBreakBetweenCloseBraceAndLast)
        ) {
          context.report({
            messageId: "unexpectedLinebreakAfterOpeningBrace",
            node,
            loc: openBrace.loc,
            fix(fixer) {
              if (hasCommentsFirstToken) return null;

              return fixer.removeRange([openBrace.range[1], first.range[0]]);
            },
          });
        }
        if (
          (!consistent && hasLineBreakBetweenCloseBraceAndLast) ||
          (consistent &&
            !hasLineBreakBetweenOpenBraceAndFirst &&
            hasLineBreakBetweenCloseBraceAndLast)
        ) {
          context.report({
            messageId: "unexpectedLinebreakBeforeClosingBrace",
            node,
            loc: closeBrace.loc,
            fix(fixer) {
              if (hasCommentsLastToken) return null;

              return fixer.removeRange([last.range[1], closeBrace.range[0]]);
            },
          });
        }
      }
    }

    return {
      JSONObjectExpression: check,
    };
  },
});
