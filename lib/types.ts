import type { JSONSchema4 } from "json-schema";
import type { Rule } from "eslint";
import type { RuleListener } from "jsonc-eslint-parser";
import type { AST as ESLintAST } from "eslint";
import type * as ESTree from "estree";

export type Token = ESLintAST.Token;
export type Comment = ESTree.Comment;

export { RuleListener };

export interface RuleModule {
  meta: RuleMetaData;
  jsoncDefineRule: PartialRuleModule;
  create(context: Rule.RuleContext): RuleListener;
}

export interface RuleMetaData {
  docs: {
    description: string;
    recommended: ("json" | "jsonc" | "json5")[] | null;
    url: string;
    ruleId: string;
    ruleName: string;
    default?: "error" | "warn";
    extensionRule:
      | boolean
      | string
      | {
          plugin: string;
          url: string;
        };
    layout: boolean;
  };
  messages: { [messageId: string]: string };
  fixable?: "code" | "whitespace";
  hasSuggestions?: boolean;
  schema: false | JSONSchema4 | JSONSchema4[];
  deprecated?: boolean;
  replacedBy?: [];
  type: "problem" | "suggestion" | "layout";
}

export interface PartialRuleModule {
  meta: PartialRuleMetaData;
  create(
    context: Rule.RuleContext,
    params: { customBlock: boolean },
  ): RuleListener;
}

export interface PartialRuleMetaData {
  docs: {
    description: string;
    recommended: ("json" | "jsonc" | "json5")[] | null;
    default?: "error" | "warn";
    extensionRule:
      | boolean
      | string
      | {
          plugin: string;
          url: string;
        };
    layout: boolean;
  };
  messages: { [messageId: string]: string };
  fixable?: "code" | "whitespace";
  hasSuggestions?: boolean;
  schema: false | JSONSchema4 | JSONSchema4[];
  deprecated?: boolean;
  replacedBy?: [];
  type: "problem" | "suggestion" | "layout";
}
