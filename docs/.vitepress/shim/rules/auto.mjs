// eslint-disable-next-line n/no-missing-import -- The file path used is the actual rule path
import { createRule } from "../utils";
export default createRule("auto", {
  meta: {
    docs: {
      description:
        "apply jsonc rules similar to your configured ESLint core rules",
      recommended: null,
      extensionRule: false,
      layout: false,
    },
    fixable: "code",
    schema: [],
    messages: {},
    type: "suggestion",
  },
  create(context) {
    const sourceCode = context.sourceCode;
    if (!sourceCode.parserServices.isJSON) {
      return {};
    }
    context.report({
      node: sourceCode.ast,
      loc: {
        line: 1,
        column: 0,
      },
      message: "The `auto` rule does not work in browsers.",
    });
    return {};
  },
});
