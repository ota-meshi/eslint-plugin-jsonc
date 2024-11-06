import { isNumberIdentifier } from "jsonc-eslint-parser";
import { createRule, isJson } from "../utils";

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
    if (!isJson(context)) {
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
