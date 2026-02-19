import { createRule, defineWrapperListener, getCoreRule } from "../utils";
const coreRule = getCoreRule("no-octal");

export default createRule("no-octal", {
  meta: {
    ...coreRule.meta,
    docs: {
      description: "disallow legacy octal literals",
      recommended: ["json", "jsonc", "json5"],
      extensionRule: true,
      layout: false,
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
