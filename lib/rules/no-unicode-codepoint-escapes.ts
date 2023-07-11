import type { AST } from "jsonc-eslint-parser";
import { createRule } from "../utils";
import { PatternMatcher } from "@eslint-community/eslint-utils";

export default createRule("no-unicode-codepoint-escapes", {
  meta: {
    docs: {
      description: "disallow Unicode code point escape sequences.",
      recommended: ["json", "jsonc", "json5"],
      extensionRule: false,
      layout: false,
    },
    fixable: "code",
    messages: {
      disallow: "Unicode code point escape sequence should not be used.",
    },
    schema: [],
    type: "problem",
  },
  create(context) {
    if (!context.parserServices.isJSON) {
      return {};
    }
    const sourceCode = context.getSourceCode();
    return {
      JSONIdentifier(node: AST.JSONIdentifier) {
        verify(node);
      },
      JSONLiteral(node: AST.JSONLiteral) {
        if (typeof node.value === "string") {
          verify(node);
        }
      },
      JSONTemplateElement(node: AST.JSONTemplateElement) {
        verify(node);
      },
    };

    /**
     * verify
     */
    function verify(node: AST.JSONNode) {
      const codePointEscapeMatcher = new PatternMatcher(/\\u\{[\dA-Fa-f]+\}/gu);
      const text = sourceCode.text.slice(...node.range);
      for (const match of codePointEscapeMatcher.execAll(text)) {
        const start = match.index;
        const end = start + match[0].length;
        const range = [start + node.range[0], end + node.range[0]];
        context.report({
          loc: {
            start: sourceCode.getLocFromIndex(range[0]),
            end: sourceCode.getLocFromIndex(range[1]),
          },
          messageId: "disallow",
          fix(fixer) {
            const codePointStr = text.slice(start + 3, end - 1);
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/fromCodePoint
            let codePoint = Number(`0x${codePointStr}`);
            let replacement = null;
            if (codePoint <= 0xffff) {
              // BMP code point
              replacement = toHex(codePoint);
            } else {
              // Astral code point; split in surrogate halves
              // http://mathiasbynens.be/notes/javascript-encoding#surrogate-formulae
              codePoint -= 0x10000;
              const highSurrogate = (codePoint >> 10) + 0xd800;
              const lowSurrogate = (codePoint % 0x400) + 0xdc00;
              replacement = `${toHex(highSurrogate)}\\u${toHex(lowSurrogate)}`;
            }
            return fixer.replaceTextRange(
              [range[0] + 2, range[1]],
              replacement,
            );
          },
        });
      }
    }

    /**
     * Number to Hex
     */
    function toHex(num: number) {
      return `0000${num.toString(16).toUpperCase()}`.substr(-4);
    }
  },
});
