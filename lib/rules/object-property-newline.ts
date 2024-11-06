// Most source code was copied from ESLint v8.
// MIT License. Copyright OpenJS Foundation and other contributors, <www.openjsf.org>
import { createRule, isJson } from "../utils";
import { getSourceCode } from "../utils/compat-momoa";

export default createRule("object-property-newline", {
  meta: {
    docs: {
      description: "enforce placing object properties on separate lines",
      recommended: null,
      extensionRule: true,
      layout: true,
    },
    type: "layout",

    schema: [
      {
        type: "object",
        properties: {
          allowAllPropertiesOnSameLine: {
            type: "boolean",
            default: false,
          },
          allowMultiplePropertiesPerLine: {
            // Deprecated
            type: "boolean",
            default: false,
          },
        },
        additionalProperties: false,
      },
    ],

    fixable: "whitespace",

    messages: {
      propertiesOnNewlineAll:
        "Object properties must go on a new line if they aren't all on the same line.",
      propertiesOnNewline: "Object properties must go on a new line.",
    },
  },
  create(context) {
    const sourceCode = getSourceCode(context);
    if (!isJson(context)) {
      return {};
    }
    const allowSameLine =
      context.options[0] &&
      (context.options[0].allowAllPropertiesOnSameLine ||
        context.options[0].allowMultiplePropertiesPerLine); /* Deprecated */
    const messageId = allowSameLine
      ? "propertiesOnNewlineAll"
      : "propertiesOnNewline";

    return {
      JSONObjectExpression(node) {
        if (allowSameLine) {
          if (node.properties.length > 1) {
            const firstTokenOfFirstProperty = sourceCode.getFirstToken(
              node.properties[0] as any,
            )!;
            const lastTokenOfLastProperty = sourceCode.getLastToken(
              node.properties[node.properties.length - 1] as any,
            )!;

            if (
              firstTokenOfFirstProperty.loc.end.line ===
              lastTokenOfLastProperty.loc.start.line
            ) {
              // All keys and values are on the same line
              return;
            }
          }
        }

        for (let i = 1; i < node.properties.length; i++) {
          const lastTokenOfPreviousProperty = sourceCode.getLastToken(
            node.properties[i - 1] as any,
          )!;
          const firstTokenOfCurrentProperty = sourceCode.getFirstToken(
            node.properties[i] as any,
          )!;

          if (
            lastTokenOfPreviousProperty.loc.end.line ===
            firstTokenOfCurrentProperty.loc.start.line
          ) {
            context.report({
              node: node as any,
              loc: firstTokenOfCurrentProperty.loc,
              messageId,
              fix(fixer) {
                const comma = sourceCode.getTokenBefore(
                  firstTokenOfCurrentProperty,
                )!;
                const rangeAfterComma = [
                  comma.range[1],
                  firstTokenOfCurrentProperty.range[0],
                ] as const;

                // Don't perform a fix if there are any comments between the comma and the next property.
                if (
                  sourceCode.text
                    .slice(rangeAfterComma[0], rangeAfterComma[1])
                    .trim()
                )
                  return null;

                return fixer.replaceTextRange(rangeAfterComma as any, "\n");
              },
            });
          }
        }
      },
    };
  },
});
