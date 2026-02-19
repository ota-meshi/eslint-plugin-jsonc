import type { AST } from "jsonc-eslint-parser";
import type { AST as VueAST } from "vue-eslint-parser";
import { createRule } from "../../utils/index.ts";
import type { RuleListener } from "../../types.ts";
import * as jsoncESLintParser from "jsonc-eslint-parser";
import type { Rule } from "eslint";

export default createRule("vue-custom-block/no-parsing-error", {
  meta: {
    docs: {
      description: "disallow parsing errors in Vue custom blocks",
      recommended: ["json", "json5", "jsonc"],
      extensionRule: false,
      layout: false,
    },
    schema: [],
    messages: {},
    type: "problem",
  },
  create(context, { customBlock }) {
    if (!customBlock) {
      return {};
    }
    const sourceCode = context.sourceCode;
    /* eslint-disable no-restricted-properties -- Workaround for bug in vue-eslint-parser v9.3.1 */
    // @ts-expect-error -- Workaround for bug in vue-eslint-parser v9.3.1
    const parserServices = context.parserServices ?? sourceCode.parserServices;
    /* eslint-enable no-restricted-properties -- Workaround for bug in vue-eslint-parser v9.3.1 */
    const parseError = parserServices.parseError;
    if (parseError) {
      return errorReportVisitor(context, parseError);
    }
    const parseCustomBlockElement:
      | ((parser: any, options: any) => any)
      | undefined = parserServices.parseCustomBlockElement;
    const customBlockElement: VueAST.VElement | undefined =
      parserServices.customBlock;

    if (customBlockElement && parseCustomBlockElement) {
      let lang = getLang(customBlockElement);
      if (!lang) {
        lang = "json";
      }
      const { error } = parseCustomBlockElement(jsoncESLintParser, {
        jsonSyntax: lang,
      });
      if (error) {
        return errorReportVisitor(context, error);
      }
    }
    return {};
  },
});

/**
 * Report error
 */
function errorReportVisitor(
  context: Rule.RuleContext,
  error: any,
): RuleListener {
  let loc: AST.Position | undefined = undefined;
  if ("column" in error && "lineNumber" in error) {
    loc = {
      line: error.lineNumber,
      column: error.column,
    };
  }
  return {
    Program(node) {
      context.report({
        // JSONC AST nodes aren't assignable to ESTree AST nodes
        node: node as never,
        loc,
        message: error.message,
      });
    },
  };
}

/**
 * Get lang from given custom block
 */
function getLang(customBlock: VueAST.VElement) {
  return (
    customBlock.startTag.attributes.find(
      (attr): attr is VueAST.VAttribute =>
        !attr.directive && attr.key.name === "lang",
    )?.value?.value || null
  );
}
