import { createRule, defineWrapperListener, getCoreRule } from "../utils";
const coreRule = getCoreRule("array-element-newline");

export default createRule("array-element-newline", {
  meta: {
    docs: {
      description: "enforce line breaks between array elements",
      recommended: null,
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
    return defineWrapperListener(coreRule, context, context.options);
  },
});
