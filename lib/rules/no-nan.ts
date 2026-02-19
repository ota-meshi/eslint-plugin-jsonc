import { isNumberIdentifier } from "jsonc-eslint-parser";
import { createRule } from "../utils/index.ts";

export default createRule("no-nan", {
  meta: {
    docs: {
      description: "disallow NaN",
      recommended: ["json", "jsonc"],
      extensionRule: false,
      layout: false,
    },
    messages: {
      disallow: "NaN should not be used.",
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
        if (node.name === "NaN") {
          context.report({
            loc: node.loc,
            messageId: "disallow",
          });
        }
      },
    };
  },
});
