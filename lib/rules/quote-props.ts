// Most source code was copied from ESLint v8.
// MIT License. Copyright OpenJS Foundation and other contributors, <www.openjsf.org>
import type { AST } from "jsonc-eslint-parser";
import { createRule } from "../utils/index.ts";
// @ts-expect-error missing types
import { tokenize } from "espree";
import { keywords } from "../utils/eslint-keywords.ts";
import { isNumericLiteral } from "../utils/eslint-ast-utils.ts";

export type RulePresetOption =
  | "always"
  | "as-needed"
  | "consistent"
  | "consistent-as-needed";

export interface RuleOptions {
  keywords?: boolean;
  unnecessary?: boolean;
  numbers?: boolean;
}

export default createRule<[RulePresetOption?, RuleOptions?]>("quote-props", {
  meta: {
    docs: {
      description: "require quotes around object literal property names",
      recommended: ["json", "jsonc"],
      extensionRule: true,
      layout: true,
    },
    type: "layout",
    schema: {
      anyOf: [
        {
          type: "array",
          items: [
            {
              type: "string",
              enum: [
                "always",
                "as-needed",
                "consistent",
                "consistent-as-needed",
              ],
            },
          ],
          minItems: 0,
          maxItems: 1,
        },
        {
          type: "array",
          items: [
            {
              type: "string",
              enum: [
                "always",
                "as-needed",
                "consistent",
                "consistent-as-needed",
              ],
            },
            {
              type: "object",
              properties: {
                keywords: {
                  type: "boolean",
                },
                unnecessary: {
                  type: "boolean",
                },
                numbers: {
                  type: "boolean",
                },
              },
              additionalProperties: false,
            },
          ],
          minItems: 0,
          maxItems: 2,
        },
      ],
    },
    fixable: "code",
    messages: {
      requireQuotesDueToReservedWord:
        "Properties should be quoted as '{{property}}' is a reserved word.",
      inconsistentlyQuotedProperty:
        "Inconsistently quoted property '{{key}}' found.",
      unnecessarilyQuotedProperty:
        "Unnecessarily quoted property '{{property}}' found.",
      unquotedReservedProperty:
        "Unquoted reserved word '{{property}}' used as key.",
      unquotedNumericProperty:
        "Unquoted number literal '{{property}}' used as key.",
      unquotedPropertyFound: "Unquoted property '{{property}}' found.",
      redundantQuoting:
        "Properties shouldn't be quoted as all quotes are redundant.",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;
    if (!sourceCode.parserServices.isJSON) {
      return {};
    }
    const MODE = context.options[0] || "always";
    const KEYWORDS = (context.options[1] && context.options[1].keywords)!;
    const CHECK_UNNECESSARY =
      !context.options[1] || context.options[1].unnecessary !== false;
    const NUMBERS = (context.options[1] && context.options[1].numbers)!;

    /**
     * Checks whether a certain string constitutes an ES3 token
     * @param tokenStr The string to be checked.
     * @returns `true` if it is an ES3 token.
     */
    function isKeyword(tokenStr: string): boolean {
      return keywords.includes(tokenStr);
    }

    /**
     * Checks if an espree-tokenized key has redundant quotes (i.e. whether quotes are unnecessary)
     * @param rawKey The raw key value from the source
     * @param tokens The espree-tokenized node key
     * @param [skipNumberLiterals] Indicates whether number literals should be checked
     * @returns Whether or not a key has redundant quotes.
     * @private
     */
    function areQuotesRedundant(
      rawKey: string,
      tokens: any,
      skipNumberLiterals = false,
    ): boolean {
      return (
        tokens.length === 1 &&
        tokens[0].start === 0 &&
        tokens[0].end === rawKey.length &&
        (["Identifier", "Keyword", "Null", "Boolean"].includes(
          tokens[0].type,
        ) ||
          (tokens[0].type === "Numeric" &&
            !skipNumberLiterals &&
            String(Number(tokens[0].value)) === tokens[0].value))
      );
    }

    /**
     * Returns a string representation of a property node with quotes removed
     * @param key Key AST Node, which may or may not be quoted
     * @returns A replacement string for this property
     */
    function getUnquotedKey(
      key: AST.JSONStringLiteral | AST.JSONIdentifier,
    ): string {
      return key.type === "JSONIdentifier" ? key.name : key.value;
    }

    /**
     * Returns a string representation of a property node with quotes added
     * @param key Key AST Node, which may or may not be quoted
     * @returns A replacement string for this property
     */
    function getQuotedKey(key: AST.JSONLiteral | AST.JSONIdentifier): string {
      if (key.type === "JSONLiteral" && typeof key.value === "string") {
        // If the key is already a string literal, don't replace the quotes with double quotes.
        return sourceCode.getText(key as any);
      }

      // Otherwise, the key is either an identifier or a number literal.
      return `"${key.type === "JSONIdentifier" ? key.name : key.value}"`;
    }

    /**
     * Ensures that a property's key is quoted only when necessary
     * @param node Property AST node
     */
    // eslint-disable-next-line complexity -- ignore
    function checkUnnecessaryQuotes(node: AST.JSONProperty): void {
      const key = node.key;

      if (node.method || node.computed || node.shorthand) return;

      if (key.type === "JSONLiteral" && typeof key.value === "string") {
        let tokens;

        try {
          tokens = tokenize(key.value);
        } catch {
          return;
        }

        if (tokens.length !== 1) return;

        const isKeywordToken = isKeyword(tokens[0].value);

        if (isKeywordToken && KEYWORDS) return;

        if (
          CHECK_UNNECESSARY &&
          areQuotesRedundant(key.value, tokens, NUMBERS)
        ) {
          context.report({
            node: node as any,
            messageId: "unnecessarilyQuotedProperty",
            data: { property: key.value },
            fix: (fixer) =>
              fixer.replaceText(key as any, getUnquotedKey(key as any)),
          });
        }
      } else if (
        KEYWORDS &&
        key.type === "JSONIdentifier" &&
        isKeyword(key.name)
      ) {
        context.report({
          node: node as any,
          messageId: "unquotedReservedProperty",
          data: { property: key.name },
          fix: (fixer) => fixer.replaceText(key as any, getQuotedKey(key)),
        });
      } else if (
        NUMBERS &&
        key.type === "JSONLiteral" &&
        isNumericLiteral(key)
      ) {
        context.report({
          node: node as any,
          messageId: "unquotedNumericProperty",
          data: { property: String(key.value) },
          fix: (fixer) => fixer.replaceText(key as any, getQuotedKey(key)),
        });
      }
    }

    /**
     * Ensures that a property's key is quoted
     * @param node Property AST node
     */
    function checkOmittedQuotes(node: AST.JSONProperty): void {
      const key = node.key;

      if (
        !node.method &&
        !node.computed &&
        !node.shorthand &&
        !(key.type === "JSONLiteral" && typeof key.value === "string")
      ) {
        context.report({
          node: node as any,
          messageId: "unquotedPropertyFound",
          data: {
            property:
              (key as AST.JSONIdentifier).name ||
              (key as AST.JSONStringLiteral).value,
          },
          fix: (fixer) => fixer.replaceText(key as any, getQuotedKey(key)),
        });
      }
    }

    /**
     * Ensures that an object's keys are consistently quoted, optionally checks for redundancy of quotes
     * @param node Property AST node
     * @param checkQuotesRedundancy Whether to check quotes' redundancy
     */
    function checkConsistency(
      node: AST.JSONObjectExpression,
      checkQuotesRedundancy: boolean,
    ): void {
      const quotedProps: AST.JSONProperty[] = [];
      const unquotedProps: AST.JSONProperty[] = [];
      let keywordKeyName: string | null = null;
      let necessaryQuotes = false;

      node.properties.forEach((rawProperty) => {
        const property = rawProperty;
        const key = property.key;

        if (!key || property.method || property.computed || property.shorthand)
          return;

        if (key.type === "JSONLiteral" && typeof key.value === "string") {
          quotedProps.push(property);

          if (checkQuotesRedundancy) {
            let tokens;

            try {
              tokens = tokenize(key.value);
            } catch {
              necessaryQuotes = true;
              return;
            }

            necessaryQuotes =
              necessaryQuotes ||
              !areQuotesRedundant(key.value, tokens) ||
              (KEYWORDS && isKeyword(tokens[0].value));
          }
        } else if (
          KEYWORDS &&
          checkQuotesRedundancy &&
          key.type === "JSONIdentifier" &&
          isKeyword(key.name)
        ) {
          unquotedProps.push(property);
          necessaryQuotes = true;
          keywordKeyName = key.name;
        } else {
          unquotedProps.push(property);
        }
      });

      if (checkQuotesRedundancy && quotedProps.length && !necessaryQuotes) {
        quotedProps.forEach((property) => {
          const key = property.key as
            | AST.JSONStringLiteral
            | AST.JSONIdentifier;
          context.report({
            node: property as any,
            messageId: "redundantQuoting",
            fix: (fixer) => fixer.replaceText(key as any, getUnquotedKey(key)),
          });
        });
      } else if (unquotedProps.length && keywordKeyName) {
        unquotedProps.forEach((property) => {
          context.report({
            node: property as any,
            messageId: "requireQuotesDueToReservedWord",
            data: { property: keywordKeyName! },
            fix: (fixer) =>
              fixer.replaceText(
                property.key as any,
                getQuotedKey(property.key),
              ),
          });
        });
      } else if (quotedProps.length && unquotedProps.length) {
        unquotedProps.forEach((property) => {
          context.report({
            node: property as any,
            messageId: "inconsistentlyQuotedProperty",
            data: {
              key:
                (property.key as AST.JSONIdentifier).name ||
                (property.key as AST.JSONStringLiteral).value,
            },
            fix: (fixer) =>
              fixer.replaceText(
                property.key as any,
                getQuotedKey(property.key),
              ),
          });
        });
      }
    }

    return {
      JSONProperty(node) {
        if (MODE === "always" || !MODE) checkOmittedQuotes(node);

        if (MODE === "as-needed") checkUnnecessaryQuotes(node);
      },
      JSONObjectExpression(node) {
        if (MODE === "consistent") checkConsistency(node, false);

        if (MODE === "consistent-as-needed") checkConsistency(node, true);
      },
    };
  },
});
