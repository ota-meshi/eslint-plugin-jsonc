import { isUndefinedIdentifier } from "jsonc-eslint-parser";
import { createRule, isJson } from "../utils";

export default createRule("no-undefined-value", {
  meta: {
    docs: {
      description: "disallow `undefined`",
      recommended: ["json", "jsonc", "json5"],
      extensionRule: false,
      layout: false,
    },
    schema: [],
    messages: {
      unexpected: "`undefined` is not allowed.",
    },
    type: "problem",
  },
  create(context) {
    if (!isJson(context)) {
      return {};
    }
    return {
      JSONIdentifier(node) {
        if (!isUndefinedIdentifier(node)) {
          return;
        }
        context.report({
          loc: node.loc,
          messageId: "unexpected",
        });
      },
    };
  },
});
