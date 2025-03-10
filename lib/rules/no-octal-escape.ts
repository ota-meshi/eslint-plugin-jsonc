import { createRule, defineWrapperListener, getCoreRule } from "../utils";
const coreRule = getCoreRule("no-octal-escape");

export default createRule("no-octal-escape", {
  meta: {
    ...coreRule.meta,
    docs: {
      description: "disallow octal escape sequences in string literals",
      recommended: null,
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
