import {
  createRule,
  defineWrapperListener,
  getCoreRule,
} from "../utils/index.ts";
const coreRule = getCoreRule("no-sparse-arrays");

export default createRule("no-sparse-arrays", {
  meta: {
    ...coreRule.meta,
    docs: {
      description: "disallow sparse arrays",
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
