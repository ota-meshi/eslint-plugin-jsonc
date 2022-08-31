import { createRule, defineWrapperListener, getCoreRule } from "../utils";
const coreRule = getCoreRule("quotes");

export default createRule("quotes", {
  meta: {
    docs: {
      description: "enforce use of double or single quotes",
      recommended: ["json", "jsonc"],
      extensionRule: true,
      layout: true,
    },
    fixable: coreRule.meta?.fixable,
    hasSuggestions: (coreRule.meta as any).hasSuggestions,
    schema: coreRule.meta!.schema!,
    messages: coreRule.meta!.messages!,
    type: coreRule.meta!.type!,
  },
  create(context) {
    const options = [...context.options];
    if (!options[0] || options[0] === "backtick") {
      options[0] = "double";
    }
    return defineWrapperListener(coreRule, context, options);
  },
});
