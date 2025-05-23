import { createRule, defineWrapperListener, getCoreRule } from "../utils";
const coreRule = getCoreRule("no-floating-decimal");

export default createRule("no-floating-decimal", {
  meta: {
    ...coreRule.meta,
    docs: {
      description:
        "disallow leading or trailing decimal points in numeric literals",
      recommended: ["json", "jsonc"],
      extensionRule: true,
      layout: true,
    },
    fixable: coreRule.meta?.fixable,
    hasSuggestions: (coreRule.meta as any).hasSuggestions,
    schema: coreRule.meta!.schema!,
    messages: coreRule.meta!.messages!,
    type: coreRule.meta!.type!,
    deprecated: false,
    replacedBy: [],
  },
  create(context) {
    return defineWrapperListener(coreRule, context, context.options);
  },
});
