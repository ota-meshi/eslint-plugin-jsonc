import type { RuleListener, AST } from "jsonc-eslint-parser";
import type { DocumentNode, ElementNode } from "@humanwhocodes/momoa";
import type { Rule } from "eslint";
import { SourceCode } from "eslint";
import type { JSONSourceCode } from "@eslint/json";
import { getSourceCode as getBaseSourceCode } from "eslint-compat-utils";
import type { BaseRuleListener, MomoaNode, MomoaRuleListener } from "../types";
import type { Token as MomoaToken } from "@humanwhocodes/momoa";

type NodeConvertMap = {
  Array: AST.JSONArrayExpression;
  Boolean: AST.JSONKeywordLiteral;
  Null: AST.JSONKeywordLiteral;
  Number:
    | AST.JSONNumberLiteral
    | [AST.JSONUnaryExpression, AST.JSONNumberLiteral];
  String: AST.JSONStringLiteral;
  Document: AST.JSONProgram;
  Object: AST.JSONObjectExpression;
  Member: AST.JSONProperty;
  Identifier: AST.JSONIdentifier;
  Infinity:
    | AST.JSONNumberIdentifier
    | [AST.JSONUnaryExpression, AST.JSONNumberIdentifier];
  NaN:
    | AST.JSONNumberIdentifier
    | [AST.JSONUnaryExpression, AST.JSONNumberIdentifier];
};

type NodeConverter = <N extends Exclude<MomoaNode, ElementNode>>(
  node: N,
) => NodeConvertMap[N["type"]];

type Token = AST.JSONProgram["tokens"][number];
type Comment = AST.JSONProgram["comments"][number];
type TokenConverter = (token: MomoaToken) => (Token | Comment)[];
const NODE_CONVERTERS = new WeakMap<DocumentNode, NodeConverter>();
const TOKEN_CONVERTERS = new WeakMap<DocumentNode, TokenConverter>();
/**
 * This is a helper function that converts the given listener into a listener that can also listen to Momoa nodes.
 */

/**
 *
 */
export function compatMomoaRuleListener(
  listener: BaseRuleListener,
  context: Rule.RuleContext,
): RuleListener {
  const convert = getNodeConverter(context);
  type ListenerKey = keyof MomoaRuleListener;
  const listenerKeys = new Set<keyof MomoaRuleListener>([
    ...(listener.Program ? (["Document"] satisfies ListenerKey[]) : []),
    ...(listener["Program:exit"]
      ? (["Document:exit"] satisfies ListenerKey[])
      : []),
    ...(listener.JSONLiteral
      ? (["Boolean", "String", "Null", "Number"] satisfies ListenerKey[])
      : []),
    ...(listener["JSONLiteral:exit"]
      ? ([
          "Boolean:exit",
          "String:exit",
          "Null:exit",
          "Number:exit",
        ] satisfies ListenerKey[])
      : []),
    ...(listener.JSONArrayExpression
      ? (["Array"] satisfies ListenerKey[])
      : []),
    ...(listener["JSONArrayExpression:exit"]
      ? (["Array:exit"] satisfies ListenerKey[])
      : []),
    ...(listener.JSONObjectExpression
      ? (["Object"] satisfies ListenerKey[])
      : []),
    ...(listener["JSONObjectExpression:exit"]
      ? (["Object:exit"] satisfies ListenerKey[])
      : []),
    ...(listener.JSONProperty ? (["Member"] satisfies ListenerKey[]) : []),
    ...(listener["JSONProperty:exit"]
      ? (["Member:exit"] satisfies ListenerKey[])
      : []),
    ...(listener.JSONIdentifier
      ? (["Identifier", "Infinity", "NaN"] satisfies ListenerKey[])
      : []),
    ...(listener["JSONIdentifier:exit"]
      ? ([
          "Identifier:exit",
          "Infinity:exit",
          "NaN:exit",
        ] satisfies ListenerKey[])
      : []),
    ...(listener.JSONUnaryExpression
      ? (["Number", "Infinity", "NaN"] satisfies ListenerKey[])
      : []),
    ...(listener["JSONUnaryExpression:exit"]
      ? (["Number:exit", "Infinity:exit", "NaN:exit"] satisfies ListenerKey[])
      : []),
  ]);

  const result: MomoaRuleListener = Object.fromEntries(
    [...listenerKeys].map((key) => {
      if (key.endsWith(":exit")) {
        return [
          key,
          (node: Exclude<MomoaNode, ElementNode>) =>
            dispatch(node, { exit: true }),
        ];
      }
      return [key, (node: Exclude<MomoaNode, ElementNode>) => dispatch(node)];
    }),
  );
  return {
    ...result,
    ...listener,
  };

  /**
   * Dispatch the given node to the listener.
   */
  function dispatch(
    node: Exclude<MomoaNode, ElementNode>,
    options?: { exit: boolean },
  ) {
    const exit = options?.exit;
    if (exit) listener[`${node.type}:exit`]?.(node as never);
    else listener[node.type]?.(node as never);

    const jsonNode = convert(node);
    if (Array.isArray(jsonNode)) {
      for (const n of jsonNode) {
        if (exit) listener[`${n.type}:exit`]?.(n as never);
        else listener[n.type]?.(n as never);
      }
    } else {
      if (exit) listener[`${jsonNode.type}:exit`]?.(jsonNode as never);
      else listener[jsonNode.type]?.(jsonNode as never);
    }
  }
}

/**
 * This is a helper function that converts the sourceCode for Momoa to a sourceCode for JSONC.
 */
export function getSourceCode(context: Rule.RuleContext): SourceCode {
  const sourceCode = getBaseSourceCode(context) as SourceCode | JSONSourceCode;
  if (sourceCode.ast.type !== "Document") {
    return sourceCode as SourceCode;
  }
  const convert = getNodeConverter(context);
  return new SourceCode(sourceCode.text, convert(sourceCode.ast) as any);
}

/**
 * Get the node converter function for the given context.
 */
function getNodeConverter(context: Rule.RuleContext): NodeConverter {
  const sourceCode = getBaseSourceCode(context) as never as JSONSourceCode;
  const converter = NODE_CONVERTERS.get(sourceCode.ast);
  if (converter) {
    return converter;
  }
  const tokenConverter = getTokenConverter(context);
  const convertedNodes = new Map<MomoaNode, AST.JSONNode | AST.JSONNode[]>();

  const nodeConverters: {
    [Node in Exclude<MomoaNode, ElementNode> as Node["type"]]: (
      node: Node,
    ) => NodeConvertMap[Node["type"]];
  } = {
    Array(node) {
      let elements;
      return {
        get parent() {
          return getParent(node) as AST.JSONArrayExpression["parent"];
        },
        type: "JSONArrayExpression",
        get elements() {
          return (elements ??= node.elements.map((e) => convertNode(e.value)));
        },
        range: node.range!,
        loc: node.loc,
      };
    },
    Boolean(node) {
      return {
        get parent() {
          return getParent(node) as AST.JSONLiteral["parent"];
        },
        type: "JSONLiteral",
        value: node.value,
        bigint: null,
        regex: null,
        get raw() {
          return sourceCode.text.slice(...node.range!);
        },
        range: node.range!,
        loc: node.loc,
      };
    },
    Null(node) {
      return {
        get parent() {
          return getParent(node) as AST.JSONLiteral["parent"];
        },
        type: "JSONLiteral",
        value: null,
        bigint: null,
        regex: null,
        get raw() {
          return sourceCode.text.slice(...node.range!);
        },
        range: node.range!,
        loc: node.loc,
      };
    },
    Number(node) {
      const raw = sourceCode.text.slice(...node.range!);
      if (raw.startsWith("-") || raw.startsWith("+")) {
        const argumentRange = [node.range![0] + 1, node.range![1]] as [
          number,
          number,
        ];
        const rawArgument = sourceCode.text.slice(...argumentRange);
        const literal: AST.JSONLiteral = {
          get parent() {
            // eslint-disable-next-line @typescript-eslint/no-use-before-define -- OK
            return unaryExpression;
          },
          type: "JSONLiteral",
          value: Number(rawArgument), // TODO Math.abs(node.value),
          bigint: null,
          regex: null,
          raw: rawArgument,
          range: argumentRange,
          loc: {
            start: {
              line: node.loc.start.line,
              column: node.loc.start.column + 1,
            },
            end: node.loc.end,
          },
        };
        const unaryExpression: AST.JSONUnaryExpression = {
          get parent() {
            return getParent(node) as AST.JSONUnaryExpression["parent"];
          },
          type: "JSONUnaryExpression",
          operator: raw[0] as "-" | "+",
          prefix: true,
          argument: literal,
          range: node.range!,
          loc: node.loc,
        };
        return [unaryExpression, literal];
      }
      return {
        get parent() {
          return getParent(node) as AST.JSONLiteral["parent"];
        },
        type: "JSONLiteral",
        value: Number(raw), // TODO node.value
        bigint: null,
        regex: null,
        get raw() {
          return sourceCode.text.slice(...node.range!);
        },
        range: node.range!,
        loc: node.loc,
      };
    },
    String(node) {
      return {
        get parent() {
          return getParent(node) as AST.JSONLiteral["parent"];
        },
        type: "JSONLiteral",
        value: node.value,
        bigint: null,
        regex: null,
        get raw() {
          return sourceCode.text.slice(...node.range!);
        },
        range: node.range!,
        loc: node.loc,
      };
    },
    Document(node): AST.JSONProgram {
      let body;
      let tokens;
      let comments;
      return {
        get parent() {
          return getParent(node) as AST.JSONProgram["parent"];
        },
        type: "Program",
        get body() {
          return (body ??= [convertNode(node.body)]);
        },
        get comments() {
          return (comments ??= node
            .tokens!.filter(
              (token) =>
                token.type === "LineComment" || token.type === "BlockComment",
            )
            .flatMap(tokenConverter));
        },
        get tokens() {
          return (tokens ??= node
            .tokens!.filter(
              (token) =>
                token.type !== "LineComment" && token.type !== "BlockComment",
            )
            .flatMap(tokenConverter));
        },
        range: node.range!,
        loc: node.loc,
      };
    },
    Object(node) {
      let members;
      return {
        get parent() {
          return getParent(node) as AST.JSONObjectExpression["parent"];
        },
        type: "JSONObjectExpression",
        get properties() {
          return (members ??= node.members.map(convertNode));
        },
        range: node.range!,
        loc: node.loc,
      };
    },
    Member(node) {
      let keyNode;
      let value;
      return {
        get parent() {
          return getParent(node) as AST.JSONProperty["parent"];
        },
        type: "JSONProperty",
        get key() {
          return (keyNode ??= convertNode(node.name));
        },
        get value() {
          return (value ??= convertNode(node.value));
        },
        kind: "init",
        method: false,
        shorthand: false,
        computed: false,
        range: node.range!,
        loc: node.loc,
      };
    },
    Identifier(node) {
      return {
        get parent() {
          return getParent(node) as AST.JSONIdentifier["parent"];
        },
        type: "JSONIdentifier",
        name: node.name,
        range: node.range!,
        loc: node.loc,
      };
    },
    Infinity(node) {
      const raw = sourceCode.text.slice(...node.range!);
      if (raw.startsWith("-") || raw.startsWith("+")) {
        const argumentRange = [node.range![0] + 1, node.range![1]] as [
          number,
          number,
        ];
        const identifier: AST.JSONNumberIdentifier = {
          get parent() {
            // eslint-disable-next-line @typescript-eslint/no-use-before-define -- OK
            return unaryExpression;
          },
          type: "JSONIdentifier",
          name: "Infinity",
          range: argumentRange,
          loc: {
            start: {
              line: node.loc.start.line,
              column: node.loc.start.column + 1,
            },
            end: node.loc.end,
          },
        };
        const unaryExpression: AST.JSONUnaryExpression = {
          get parent() {
            return getParent(node) as AST.JSONUnaryExpression["parent"];
          },
          type: "JSONUnaryExpression",
          operator: raw[0] as "-" | "+",
          prefix: true,
          argument: identifier,
          range: node.range!,
          loc: node.loc,
        };
        return [unaryExpression, identifier];
      }
      return {
        get parent() {
          return getParent(node) as AST.JSONIdentifier["parent"];
        },
        type: "JSONIdentifier",
        name: "Infinity",
        range: node.range!,
        loc: node.loc,
      };
    },
    NaN(node) {
      const raw = sourceCode.text.slice(...node.range!);
      if (raw.startsWith("-") || raw.startsWith("+")) {
        const argumentRange = [node.range![0] + 1, node.range![1]] as [
          number,
          number,
        ];
        const identifier: AST.JSONNumberIdentifier = {
          get parent() {
            // eslint-disable-next-line @typescript-eslint/no-use-before-define -- OK
            return unaryExpression;
          },
          type: "JSONIdentifier",
          name: "NaN",
          range: argumentRange,
          loc: {
            start: {
              line: node.loc.start.line,
              column: node.loc.start.column + 1,
            },
            end: node.loc.end,
          },
        };
        const unaryExpression: AST.JSONUnaryExpression = {
          get parent() {
            return getParent(node) as AST.JSONUnaryExpression["parent"];
          },
          type: "JSONUnaryExpression",
          operator: raw[0] as "-" | "+",
          prefix: true,
          argument: identifier,
          range: node.range!,
          loc: node.loc,
        };
        return [unaryExpression, identifier];
      }
      return {
        get parent() {
          return getParent(node) as AST.JSONIdentifier["parent"];
        },
        type: "JSONIdentifier",
        name: "NaN",
        range: node.range!,
        loc: node.loc,
      };
    },
  };
  NODE_CONVERTERS.set(sourceCode.ast, convertNode as NodeConverter);
  return convertNode as NodeConverter;

  /**
   * Get the parent node of the given node.
   */
  function getParent(node: MomoaNode): AST.JSONNode | null {
    const parent = sourceCode.getParent(node);
    if (!parent) return null;
    const parentNode = parent as MomoaNode;
    if (parentNode.type === "Element") {
      // There is no jsonc-eslint-parser node that corresponds to the Element node.
      return getParent(parentNode);
    }
    const convertedParent = convertNode(parentNode);
    if (Array.isArray(convertedParent)) {
      return convertedParent[0];
    }
    return convertedParent;
  }

  /**
   * Convert the given momoa node to a JSONC node.
   */
  function convertNode<T extends AST.JSONNode>(
    node: Exclude<MomoaNode, ElementNode>,
  ): T | T[] {
    if (convertedNodes.has(node)) {
      return convertedNodes.get(node)! as T | T[];
    }

    const newNode = nodeConverters[node.type](node as never);
    convertedNodes.set(node, newNode as never);
    return newNode as T | T[];
  }
}

/**
 * Get the token converter function for the given context.
 */
function getTokenConverter(context: Rule.RuleContext): TokenConverter {
  const sourceCode = getBaseSourceCode(context) as never as JSONSourceCode;
  const converter = TOKEN_CONVERTERS.get(sourceCode.ast);
  if (converter) {
    return converter;
  }
  const convertedTokens = new Map<MomoaToken, (Token | Comment)[]>();

  const tokenConverters: {
    [Node in MomoaToken["type"]]: (token: MomoaToken) => (Token | Comment)[];
  } = {
    BlockComment(token) {
      return [
        {
          type: "Block",
          get value() {
            return sourceCode.text.slice(
              token.range![0] + 2,
              token.range![1] - 2,
            );
          },
          range: token.range,
          loc: token.loc,
        },
      ];
    },
    LineComment(token) {
      return [
        {
          type: "Line",
          get value() {
            return sourceCode.text.slice(token.range![0] + 2, token.range![1]);
          },
          range: token.range,
          loc: token.loc,
        },
      ];
    },
    Boolean(token) {
      return [
        {
          type: "Keyword",
          get value() {
            return sourceCode.text.slice(...token.range!);
          },
          range: token.range!,
          loc: token.loc,
        },
      ];
    },
    Null(token) {
      return [
        {
          type: "Keyword",
          get value() {
            return sourceCode.text.slice(...token.range!);
          },
          range: token.range!,
          loc: token.loc,
        },
      ];
    },
    Identifier(token) {
      return [
        {
          type: "Identifier",
          get value() {
            return sourceCode.text.slice(...token.range!);
          },
          range: token.range!,
          loc: token.loc,
        },
      ];
    },
    Infinity(token) {
      const raw = sourceCode.text.slice(...token.range!);
      if (raw.startsWith("-") || raw.startsWith("+")) {
        return [
          {
            type: "Punctuator",
            value: raw[0],
            range: [token.range![0], token.range![0] + 1],
            loc: {
              start: token.loc.start,
              end: {
                line: token.loc.start.line,
                column: token.loc.start.column + 1,
              },
            },
          },
          {
            type: "Identifier",
            value: "Infinity",
            range: [token.range![0] + 1, token.range![1]],
            loc: {
              start: {
                line: token.loc.start.line,
                column: token.loc.start.column + 1,
              },
              end: token.loc.end,
            },
          },
        ];
      }
      return [
        {
          type: "Identifier",
          value: "Infinity",
          range: token.range!,
          loc: token.loc,
        },
      ];
    },
    NaN(token) {
      const raw = sourceCode.text.slice(...token.range!);
      if (raw.startsWith("-") || raw.startsWith("+")) {
        return [
          {
            type: "Punctuator",
            value: raw[0],
            range: [token.range![0], token.range![0] + 1],
            loc: {
              start: token.loc.start,
              end: {
                line: token.loc.start.line,
                column: token.loc.start.column + 1,
              },
            },
          },
          {
            type: "Identifier",
            value: "NaN",
            range: [token.range![0] + 1, token.range![1]],
            loc: {
              start: {
                line: token.loc.start.line,
                column: token.loc.start.column + 1,
              },
              end: token.loc.end,
            },
          },
        ];
      }
      return [
        {
          type: "Identifier",
          value: "NaN",
          range: token.range!,
          loc: token.loc,
        },
      ];
    },
    Number(token) {
      const raw = sourceCode.text.slice(...token.range!);
      if (raw.startsWith("-") || raw.startsWith("+")) {
        const range = [token.range![0] + 1, token.range![1]] as [
          number,
          number,
        ];
        return [
          {
            type: "Punctuator",
            value: raw[0],
            range: [token.range![0], token.range![0] + 1],
            loc: {
              start: token.loc.start,
              end: {
                line: token.loc.start.line,
                column: token.loc.start.column + 1,
              },
            },
          },
          {
            type: "Numeric",
            get value() {
              return sourceCode.text.slice(...range);
            },
            range,
            loc: {
              start: {
                line: token.loc.start.line,
                column: token.loc.start.column + 1,
              },
              end: token.loc.end,
            },
          },
        ];
      }
      return [
        {
          type: "Numeric",
          get value() {
            return sourceCode.text.slice(...token.range!);
          },
          range: token.range!,
          loc: token.loc,
        },
      ];
    },
    String(token) {
      return [
        {
          type: "String",
          get value() {
            return sourceCode.text.slice(...token.range!);
          },
          range: token.range!,
          loc: token.loc,
        },
      ];
    },
    Colon(token) {
      return [
        {
          type: "Punctuator",
          value: ":",
          range: token.range!,
          loc: token.loc,
        },
      ];
    },
    Comma(token) {
      return [
        {
          type: "Punctuator",
          value: ",",
          range: token.range!,
          loc: token.loc,
        },
      ];
    },
    LBracket(token) {
      return [
        {
          type: "Punctuator",
          value: "[",
          range: token.range!,
          loc: token.loc,
        },
      ];
    },
    LBrace(token) {
      return [
        {
          type: "Punctuator",
          value: "{",
          range: token.range!,
          loc: token.loc,
        },
      ];
    },
    RBracket(token) {
      return [
        {
          type: "Punctuator",
          value: "]",
          range: token.range!,
          loc: token.loc,
        },
      ];
    },
    RBrace(token) {
      return [
        {
          type: "Punctuator",
          value: "}",
          range: token.range!,
          loc: token.loc,
        },
      ];
    },
  };
  TOKEN_CONVERTERS.set(sourceCode.ast, convertToken);
  return convertToken;

  /**
   * Convert the given momoa token to a JSONC token.
   */
  function convertToken(token: MomoaToken): (Token | Comment)[] {
    if (convertedTokens.has(token)) {
      return convertedTokens.get(token)!;
    }

    const newToken = tokenConverters[token.type](token);
    convertedTokens.set(token, newToken);
    return newToken;
  }
}
