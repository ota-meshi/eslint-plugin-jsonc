import type { AST } from "jsonc-eslint-parser";
import { isNumberIdentifier } from "jsonc-eslint-parser";
import { createRule } from "../utils";
import { getSourceCode } from "eslint-compat-utils";

export default createRule("no-infinity", {
  meta: {
    docs: {
      description: "disallow Infinity",
      recommended: ["json", "jsonc"],
      extensionRule: false,
      layout: false,
    },
    messages: {
      disallow: "Infinity should not be used.",
    },
    schema: [],
    type: "problem",
  },
  create(context) {
    const sourceCode = getSourceCode(context);
    if (!sourceCode.parserServices.isJSON) {
      return {};
    }
    return {
      JSONIdentifier(node: AST.JSONIdentifier) {
        if (!isNumberIdentifier(node)) {
          return;
        }
        if (node.name === "Infinity") {
          context.report({
            loc: node.loc,
            messageId: "disallow",
          });
        }
      },
    };
  },
});
