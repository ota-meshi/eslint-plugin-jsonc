import { createRule, defineWrapperListener, getCoreRule } from "../utils";
const coreRule = getCoreRule("no-irregular-whitespace");

export default createRule("no-irregular-whitespace", {
  meta: {
    ...coreRule.meta,
    docs: {
      description: "disallow irregular whitespace",
      // TODO: We will switch this in the next major version.
      recommended: null,
      // recommended: ["json", "jsonc", "json5"], // TODO: We need to turn off core `no-irregular-whitespace` rule in shared config.
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
