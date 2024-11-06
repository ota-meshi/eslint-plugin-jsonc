import { isNumberIdentifier } from "jsonc-eslint-parser";
import { createRule, isJson } from "../utils";

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
    if (!isJson(context)) {
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
