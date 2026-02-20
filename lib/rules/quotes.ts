// Most source code was copied from ESLint v8.
// MIT License. Copyright OpenJS Foundation and other contributors, <www.openjsf.org>
import type { AST } from "jsonc-eslint-parser";
import { createRule } from "../utils/index.ts";
import { LINEBREAKS, isSurroundedBy } from "../utils/eslint-ast-utils.ts";

/**
 * Switches quoting of javascript string between ' " and `
 * escaping and unescaping as necessary.
 * Only escaping of the minimal set of characters is changed.
 * Note: escaping of newlines when switching from backtick to other quotes is not handled.
 * @param str A string to convert.
 * @returns The string with changed quotes.
 * @private
 */
function switchQuote(this: { quote: string }, str: string) {
  const newQuote = this.quote;
  const oldQuote = str[0];

  if (newQuote === oldQuote) return str;

  return (
    newQuote +
    str
      .slice(1, -1)
      .replace(
        /\\(\$\{|\r\n?|\n|.)|["'`]|\$\{|(\r\n?|\n)/gu,
        (match, escaped, newline) => {
          if (escaped === oldQuote || (oldQuote === "`" && escaped === "${"))
            return escaped; // unescape

          if (match === newQuote || (newQuote === "`" && match === "${"))
            return `\\${match}`; // escape

          if (newline && oldQuote === "`") return "\\n"; // escape newlines

          return match;
        },
      ) +
    newQuote
  );
}

const QUOTE_SETTINGS = {
  double: {
    quote: '"',
    alternateQuote: "'",
    description: "doublequote",
    convert: switchQuote,
  },
  single: {
    quote: "'",
    alternateQuote: '"',
    description: "singlequote",
    convert: switchQuote,
  },
  backtick: {
    quote: "`",
    alternateQuote: '"',
    description: "backtick",
    convert: switchQuote,
  },
};

// An unescaped newline is a newline preceded by an even number of backslashes.
const UNESCAPED_LINEBREAK_PATTERN = new RegExp(
  String.raw`(^|[^\\])(\\\\)*[${Array.from(LINEBREAKS).join("")}]`,
  "u",
);

const AVOID_ESCAPE = "avoid-escape";

export interface RuleOptions {
  avoidEscape?: boolean;
  allowTemplateLiterals?: boolean;
}

export default createRule<
  ["single" | "double" | "backtick", "avoid-escape" | RuleOptions]
>("quotes", {
  meta: {
    docs: {
      description: "enforce use of double or single quotes",
      recommended: ["json", "jsonc"],
      extensionRule: true,
      layout: true,
    },
    type: "layout",
    fixable: "code",
    schema: [
      {
        type: "string",
        enum: ["single", "double", "backtick"],
      },
      {
        anyOf: [
          {
            type: "string",
            enum: ["avoid-escape"],
          },
          {
            type: "object",
            properties: {
              avoidEscape: {
                type: "boolean",
              },
              allowTemplateLiterals: {
                type: "boolean",
              },
            },
            additionalProperties: false,
          },
        ],
      },
    ],
    messages: {
      wrongQuotes: "Strings must use {{description}}.",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;
    if (!sourceCode.parserServices.isJSON) {
      return {};
    }
    let quoteOption = context.options[0];
    if (quoteOption === "backtick") {
      quoteOption = "double";
    }
    const settings = QUOTE_SETTINGS[quoteOption || "double"];
    const options = context.options[1];
    const allowTemplateLiterals =
      options &&
      typeof options === "object" &&
      options.allowTemplateLiterals === true;
    let avoidEscape =
      options && typeof options === "object" && options.avoidEscape === true;

    // deprecated
    if (options === AVOID_ESCAPE) avoidEscape = true;

    /**
     * Checks whether or not a given TemplateLiteral node is actually using any of the special features provided by template literal strings.
     * @param node A TemplateLiteral node to check.
     * @returns Whether or not the TemplateLiteral node is using any of the special features provided by template literal strings.
     * @private
     */
    function isUsingFeatureOfTemplateLiteral(node: AST.JSONTemplateLiteral) {
      const hasStringInterpolation = node.expressions.length > 0;

      if (hasStringInterpolation) return true;

      const isMultilineString =
        node.quasis.length >= 1 &&
        UNESCAPED_LINEBREAK_PATTERN.test(node.quasis[0].value.raw);

      if (isMultilineString) return true;

      return false;
    }

    return {
      JSONLiteral(node) {
        const val = node.value;
        const rawVal = node.raw;

        if (settings && typeof val === "string") {
          let isValid = isSurroundedBy(rawVal, settings.quote);

          if (!isValid && avoidEscape)
            isValid =
              isSurroundedBy(rawVal, settings.alternateQuote) &&
              rawVal.includes(settings.quote);

          if (!isValid) {
            context.report({
              node,
              messageId: "wrongQuotes",
              data: {
                description: settings.description,
              },
              fix(fixer) {
                return fixer.replaceText(node, settings.convert(node.raw));
              },
            });
          }
        }
      },

      JSONTemplateLiteral(node) {
        // Don't throw an error if backticks are expected or a template literal feature is in use.
        if (allowTemplateLiterals || isUsingFeatureOfTemplateLiteral(node))
          return;

        context.report({
          node,
          messageId: "wrongQuotes",
          data: {
            description: settings.description,
          },
          fix(fixer) {
            return fixer.replaceText(
              node,
              settings.convert(sourceCode.getText(node)),
            );
          },
        });
      },
    };
  },
});
