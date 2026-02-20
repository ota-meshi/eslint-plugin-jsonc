import type { JSONSchema4 } from "json-schema";
import type {
  BuiltInRuleListenerExits,
  BuiltInRuleListeners,
  RuleListener,
  AST,
} from "jsonc-eslint-parser";
import type * as core from "@eslint/core";
import type { AnyNode } from "@humanwhocodes/momoa";
import type {
  JSONCLanguageOptions,
  JSONCSourceCode,
} from "./language/index.ts";
import type { JSONCTokenOrComment } from "./language/jsonc-source-code.ts";

export type JSONCNodeOrToken = AST.JSONNode | JSONCTokenOrComment;

export { RuleListener };

export type MomoaNode = AnyNode;
type MomoaRuleFunction<Node extends MomoaNode = never> = (node: Node) => void;
type MomoaBuiltInRuleListeners = {
  [Node in MomoaNode as Node["type"]]?: MomoaRuleFunction<Node>;
};
type MomoaBuiltInRuleListenerExits = {
  [Node in MomoaNode as `${Node["type"]}:exit`]?: MomoaRuleFunction<Node>;
};
export type MomoaRuleListener = MomoaBuiltInRuleListeners &
  MomoaBuiltInRuleListenerExits;
export type BaseRuleListener = MomoaRuleListener &
  BuiltInRuleListeners &
  BuiltInRuleListenerExits;

export interface RuleModule<
  RuleOptions extends unknown[] = unknown[],
> extends core.RuleDefinition<{
  LangOptions: JSONCLanguageOptions;
  Code: JSONCSourceCode;
  RuleOptions: RuleOptions;
  Visitor: RuleListener;
  Node: AST.JSONNode;
  MessageIds: string;
  ExtRuleDocs: RuleMetaDocs;
}> {
  meta: RuleMetaData<RuleOptions>;
  /** @internal */
  jsoncDefineRule: PartialRuleModule<RuleOptions>;
}
export type RuleMetaDocs = {
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

export type RuleContext<RuleOptions extends unknown[] = unknown[]> =
  core.RuleContext<{
    LangOptions: JSONCLanguageOptions;
    Code: JSONCSourceCode;
    RuleOptions: RuleOptions;
    Node: JSONCNodeOrToken;
    MessageIds: string;
  }>;

export interface RuleMetaData<
  RuleOptions extends unknown[] = unknown[],
> extends core.RulesMeta<string, RuleOptions, RuleMetaDocs> {
  docs: RuleMetaDocs;
}

export interface PartialRuleModule<RuleOptions extends unknown[] = unknown[]> {
  meta: PartialRuleMetaData<RuleOptions>;
  create: (
    context: RuleContext<RuleOptions>,
    params: { customBlock: boolean },
  ) => BaseRuleListener;
}

export interface PartialRuleMetaData<
  RuleOptions extends unknown[] = unknown[],
> {
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
  defaultOptions?: RuleOptions;
  schema: false | JSONSchema4 | JSONSchema4[];
  deprecated?: boolean;
  replacedBy?: [];
  type: "problem" | "suggestion" | "layout";
}
