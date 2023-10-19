import type { AST } from "jsonc-eslint-parser";
import type { VAttribute, VElement } from "vue-eslint-parser/ast";
import { createRule } from "../../utils";
import type { RuleListener } from "../../types";
import * as jsoncESLintParser from "jsonc-eslint-parser";
import type { Rule } from "eslint";
import { getSourceCode } from "eslint-compat-utils";

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
    const sourceCode = getSourceCode(context);
    // eslint-disable-next-line no-restricted-properties -- Workaround for bug in vue-eslint-parser v9.3.1
    const parserServices = context.parserServices ?? sourceCode.parserServices;
    const parseError = parserServices.parseError;
    if (parseError) {
      return errorReportVisitor(context, parseError);
    }
    const parseCustomBlockElement:
      | ((parser: any, options: any) => any)
      | undefined = parserServices.parseCustomBlockElement;
    const customBlockElement: VElement | undefined = parserServices.customBlock;

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
function getLang(customBlock: VElement) {
  return (
    customBlock.startTag.attributes.find(
      (attr): attr is VAttribute => !attr.directive && attr.key.name === "lang",
    )?.value?.value || null
  );
}
