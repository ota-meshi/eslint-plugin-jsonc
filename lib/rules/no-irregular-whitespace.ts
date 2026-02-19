import {
  createRule,
  defineWrapperListener,
  getCoreRule,
} from "../utils/index.ts";
const coreRule = getCoreRule("no-irregular-whitespace");

export default createRule("no-irregular-whitespace", {
  meta: {
    ...coreRule.meta,
    docs: {
      description: "disallow irregular whitespace",
      recommended: ["json", "jsonc", "json5"],
      extensionRule: true,
      layout: false,
    },
    fixable: coreRule.meta?.fixable,
    hasSuggestions: (coreRule.meta as any)?.hasSuggestions,
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
