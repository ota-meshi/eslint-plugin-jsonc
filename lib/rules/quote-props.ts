import { createRule, defineWrapperListener, getCoreRule } from "../utils";
const coreRule = getCoreRule("quote-props");

export default createRule("quote-props", {
  meta: {
    docs: {
      description: "require quotes around object literal property names",
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
    if (!options[0]) {
      options[0] = "always";
    }
    return defineWrapperListener(coreRule, context, options);
  },
});
