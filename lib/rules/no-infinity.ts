import { isNumberIdentifier } from "jsonc-eslint-parser";
import { createRule } from "../utils/index.ts";

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
    if (!context.sourceCode.parserServices.isJSON) {
      return {};
    }
    return {
      JSONIdentifier(node) {
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
