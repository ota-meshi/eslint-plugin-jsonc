import type { RuleListener, AST } from "jsonc-eslint-parser";
import { VisitorKeys } from "jsonc-eslint-parser";
import type { Token as MomoaToken, DocumentNode } from "@humanwhocodes/momoa";
import type { Rule } from "eslint";
import { SourceCode } from "eslint";
import type { JSONSourceCode } from "@eslint/json";
import { getSourceCode, getCwd, getFilename } from "eslint-compat-utils";
import type { MomoaNode, MomoaRuleListener } from "../types";

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

type TargetMomoaNode = Extract<MomoaNode, { type: keyof NodeConvertMap }>;

type NodeConverter = <N extends TargetMomoaNode>(
  node: N,
) => NodeConvertMap[N["type"]];

type Token = AST.JSONProgram["tokens"][number];
type Comment = AST.JSONProgram["comments"][number];
type JSONToken = Token | Comment;
type TokenConverter = (token: MomoaToken) => JSONToken | JSONToken[];

const NODE_CONVERTERS = new WeakMap<DocumentNode, NodeConverter>();
const TOKEN_CONVERTERS = new WeakMap<DocumentNode, TokenConverter>();

const MOMOA_NODES = new Set<MomoaNode["type"]>([
  "Array",
  "Boolean",
  "Document",
  "Element",
  "Identifier",
  "Infinity",
  "Member",
  "NaN",
  "Null",
  "Number",
  "Object",
  "String",
]);

/**
 * This is a helper function that converts the given create function into a Momoa compatible create function.
 */
export function compatMomoaCreate<
  R extends object,
  F extends (context: Rule.RuleContext, ...args: any[]) => R,
>(create: F): F {
  return ((context, ...args) => {
    const originalSourceCode = getSourceCode(context) as
      | SourceCode
      | JSONSourceCode;
    if (!isMomoaSourceCode(originalSourceCode)) {
      // If the source code is not Momoa, return the original create function.

      // Define the `sourceCode` property to work with older ESLints.
      const compatContext: Rule.RuleContext = {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment -- special
        // @ts-expect-error
        __proto__: context,
        sourceCode: originalSourceCode,
        get filename() {
          return getFilename(context);
        },
        get cwd() {
          return getCwd(context);
        },
      };
      return create(compatContext, ...args);
    }

    let sourceCode;
    const compatContext: Rule.RuleContext = {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment -- special
      // @ts-expect-error
      __proto__: context,
      get sourceCode() {
        return (sourceCode ??= getCompatSourceCode(originalSourceCode));
      },
      report(descriptor) {
        // Revert to `@eslint/json` report position (1-based column).
        const momoaDescriptor = {
          ...descriptor,
        };
        if ("loc" in momoaDescriptor) {
          if ("line" in momoaDescriptor.loc) {
            momoaDescriptor.loc = convertPositionFromJsoncToMomoa(
              momoaDescriptor.loc,
            );
          } else {
            momoaDescriptor.loc = convertSourceLocationFromJsoncToMomoa(
              momoaDescriptor.loc,
            );
          }
        }
        if ("node" in momoaDescriptor) {
          momoaDescriptor.node = {
            ...momoaDescriptor.node,
            loc: convertSourceLocationFromJsoncToMomoa(
              momoaDescriptor.node.loc!,
            ),
          };
        }
        context.report(momoaDescriptor);
      },
    };

    return compatMomoaRuleListener(
      create(compatContext, ...args) as RuleListener,
      originalSourceCode,
    );
  }) as F;
}

/**
 * This is a helper function that converts the given listener into a listener that can also listen to Momoa nodes.
 */
function compatMomoaRuleListener(
  listener: RuleListener,
  momoaSourceCode: JSONSourceCode,
): RuleListener {
  const convert = getNodeConverter(momoaSourceCode);
  const listenerKeysSet = new Set<keyof MomoaRuleListener>();
  for (const [jsonKey, momoaKeys] of [
    ["Program", ["Document"]],
    ["JSONLiteral", ["Boolean", "String", "Null", "Number"]],
    ["JSONArrayExpression", ["Array"]],
    ["JSONObjectExpression", ["Object"]],
    ["JSONProperty", ["Member"]],
    ["JSONIdentifier", ["Identifier", "Infinity", "NaN"]],
    ["JSONUnaryExpression", ["Number", "Infinity", "NaN"]],
  ] as const) {
    if (listener[jsonKey]) {
      for (const momoaKey of momoaKeys) {
        listenerKeysSet.add(momoaKey);
      }
    }
    if (listener[`${jsonKey}:exit`]) {
      for (const momoaKey of momoaKeys) {
        listenerKeysSet.add(`${momoaKey}:exit`);
      }
    }
  }

  const result: RuleListener = Object.fromEntries(
    [...listenerKeysSet].map((key) => {
      const listener = key.endsWith(":exit") ? dispatchExit : dispatch;
      return [key, listener];
    }),
  );

  for (const [key, fn] of Object.entries(listener)) {
    if (!fn) continue;

    const newFn = (node: AST.JSONNode | MomoaNode, ...args: []) => {
      if (isMomoaNode(node)) {
        if (node.type !== "Element") {
          const invoke = key.endsWith(":exit")
            ? invokeWithReverseConvertedNode
            : invokeWithConvertedNode;
          invoke(node, (n) => fn(n as never, ...args));
        }
      } else {
        fn(node as never, ...args);
      }
    };

    const momoaFn = result[key];
    if (momoaFn) {
      result[key] = (...args) => {
        momoaFn(...args);
        newFn(...args);
      };
    } else {
      result[key] = newFn;
    }
  }
  return result;

  /**
   * Dispatch the given node to the listener.
   */
  function dispatch(node: TargetMomoaNode) {
    invokeWithConvertedNode(node, (n) => listener[n.type]?.(n as never));
  }

  /**
   * Dispatch the given node to the exit listener.
   */
  function dispatchExit(node: TargetMomoaNode) {
    invokeWithReverseConvertedNode(node, (n) =>
      listener[`${n.type}:exit`]?.(n as never),
    );
  }

  /**
   * Invoke the given callback with the converted node.
   */
  function invokeWithConvertedNode(
    node: TargetMomoaNode,
    cb: (node: AST.JSONNode) => void,
  ) {
    const jsonNode = convert(node);
    if (Array.isArray(jsonNode)) {
      for (const n of jsonNode) {
        cb(n);
      }
    } else {
      cb(jsonNode);
    }
  }

  /**
   * Invoke the given callback with the converted node in reverse order.
   */
  function invokeWithReverseConvertedNode(
    node: TargetMomoaNode,
    cb: (node: AST.JSONNode) => void,
  ) {
    const jsonNode = convert(node);
    if (Array.isArray(jsonNode)) {
      for (let index = jsonNode.length - 1; index >= 0; index--) {
        const n = jsonNode[index];
        cb(n);
      }
    } else {
      cb(jsonNode);
    }
  }
}

/**
 * Check whether the given sourceCode is a Momoa sourceCode.
 */
function isMomoaSourceCode(
  sourceCode: SourceCode | JSONSourceCode,
): sourceCode is JSONSourceCode {
  return (
    sourceCode.ast.type === "Document" &&
    sourceCode.ast.loc.start.column === 1 &&
    [
      "Array",
      "Object",
      "Boolean",
      "String",
      "Number",
      "Null",
      "NaN",
      "Infinity",
    ].includes(sourceCode.ast.body?.type) &&
    typeof (sourceCode as JSONSourceCode).getParent === "function"
  );
}

/**
 * Check whether the given node is a Momoa node.
 */
function isMomoaNode(node: AST.JSONNode | MomoaNode): node is MomoaNode {
  return MOMOA_NODES.has((node as MomoaNode).type);
}

/**
 * This is a helper function that converts the sourceCode for Momoa to a sourceCode for JSONC.
 */
function getCompatSourceCode(momoaSourceCode: JSONSourceCode): SourceCode {
  const convert = getNodeConverter(momoaSourceCode);
  const jsSourceCode = new SourceCode({
    text: momoaSourceCode.text,
    ast: convert(momoaSourceCode.ast) as any,
    parserServices: { isJSON: true },
    visitorKeys: VisitorKeys,
  });

  const compatSourceCode: SourceCode | JSONSourceCode = new Proxy(
    momoaSourceCode,
    {
      get(_target, prop) {
        const value = Reflect.get(jsSourceCode, prop);
        if (value !== undefined)
          return typeof value === "function" ? value.bind(jsSourceCode) : value;
        const momoaValue = Reflect.get(momoaSourceCode, prop);
        return typeof momoaValue === "function"
          ? momoaValue.bind(momoaSourceCode)
          : momoaValue;
      },
    },
  );

  return compatSourceCode as unknown as SourceCode;
}

/**
 * Get the node converter function for the given sourceCode.
 */
function getNodeConverter(momoaSourceCode: JSONSourceCode): NodeConverter {
  const converter = NODE_CONVERTERS.get(momoaSourceCode.ast);
  if (converter) {
    return converter;
  }
  const tokenConverter = getTokenConverter(momoaSourceCode);
  const convertedNodes = new Map<MomoaNode, AST.JSONNode | AST.JSONNode[]>();

  const nodeConverters: {
    [Node in TargetMomoaNode as Node["type"]]: (
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
        loc: convertSourceLocationFromMomoaToJsonc(node.loc),
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
          return momoaSourceCode.text.slice(...node.range!);
        },
        range: node.range!,
        loc: convertSourceLocationFromMomoaToJsonc(node.loc),
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
          return momoaSourceCode.text.slice(...node.range!);
        },
        range: node.range!,
        loc: convertSourceLocationFromMomoaToJsonc(node.loc),
      };
    },
    Number(node) {
      const raw = momoaSourceCode.text.slice(...node.range!);
      if (raw.startsWith("-") || raw.startsWith("+")) {
        const argumentRange = [node.range![0] + 1, node.range![1]] as [
          number,
          number,
        ];
        const rawArgument = momoaSourceCode.text.slice(...argumentRange);
        const literal: AST.JSONLiteral = {
          get parent() {
            // eslint-disable-next-line @typescript-eslint/no-use-before-define -- OK
            return unaryExpression;
          },
          type: "JSONLiteral",
          value: Math.abs(node.value),
          bigint: null,
          regex: null,
          raw: rawArgument,
          range: argumentRange,
          loc: convertSourceLocationFromMomoaToJsonc({
            start: {
              line: node.loc.start.line,
              column: node.loc.start.column + 1,
            },
            end: node.loc.end,
          }),
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
          loc: convertSourceLocationFromMomoaToJsonc(node.loc),
        };
        return [unaryExpression, literal];
      }
      return {
        get parent() {
          return getParent(node) as AST.JSONLiteral["parent"];
        },
        type: "JSONLiteral",
        value: node.value,
        bigint: null,
        regex: null,
        get raw() {
          return momoaSourceCode.text.slice(...node.range!);
        },
        range: node.range!,
        loc: convertSourceLocationFromMomoaToJsonc(node.loc),
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
          return momoaSourceCode.text.slice(...node.range!);
        },
        range: node.range!,
        loc: convertSourceLocationFromMomoaToJsonc(node.loc),
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
        loc: convertSourceLocationFromMomoaToJsonc(node.loc),
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
        loc: convertSourceLocationFromMomoaToJsonc(node.loc),
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
        loc: convertSourceLocationFromMomoaToJsonc(node.loc),
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
        loc: convertSourceLocationFromMomoaToJsonc(node.loc),
      };
    },
    Infinity(node) {
      const raw = momoaSourceCode.text.slice(...node.range!);
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
          loc: convertSourceLocationFromMomoaToJsonc({
            start: {
              line: node.loc.start.line,
              column: node.loc.start.column + 1,
            },
            end: node.loc.end,
          }),
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
          loc: convertSourceLocationFromMomoaToJsonc(node.loc),
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
        loc: convertSourceLocationFromMomoaToJsonc(node.loc),
      };
    },
    NaN(node) {
      const raw = momoaSourceCode.text.slice(...node.range!);
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
          loc: convertSourceLocationFromMomoaToJsonc({
            start: {
              line: node.loc.start.line,
              column: node.loc.start.column + 1,
            },
            end: node.loc.end,
          }),
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
          loc: convertSourceLocationFromMomoaToJsonc(node.loc),
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
        loc: convertSourceLocationFromMomoaToJsonc(node.loc),
      };
    },
  };
  NODE_CONVERTERS.set(momoaSourceCode.ast, convertNode as NodeConverter);
  return convertNode as NodeConverter;

  /**
   * Get the parent node of the given node.
   */
  function getParent(node: MomoaNode): AST.JSONNode | null {
    const parent = momoaSourceCode.getParent(node);
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
  function convertNode<T extends AST.JSONNode>(node: TargetMomoaNode): T | T[] {
    if (convertedNodes.has(node)) {
      return convertedNodes.get(node)! as T | T[];
    }

    const newNode = nodeConverters[node.type](node as never);
    convertedNodes.set(node, newNode as never);
    return newNode as T | T[];
  }
}

/**
 * Get the token converter function for the given sourceCode.
 */
function getTokenConverter(momoaSourceCode: JSONSourceCode): TokenConverter {
  const converter = TOKEN_CONVERTERS.get(momoaSourceCode.ast);
  if (converter) {
    return converter;
  }
  const convertedTokens = new Map<MomoaToken, JSONToken | JSONToken[]>();

  const tokenConverters: {
    [Node in MomoaToken["type"]]: (
      token: MomoaToken,
    ) => JSONToken | JSONToken[];
  } = {
    BlockComment(token) {
      return {
        type: "Block",
        get value() {
          return momoaSourceCode.text.slice(
            token.range![0] + 2,
            token.range![1] - 2,
          );
        },
        range: token.range,
        loc: convertSourceLocationFromMomoaToJsonc(token.loc),
      };
    },
    LineComment(token) {
      return {
        type: "Line",
        get value() {
          return momoaSourceCode.text.slice(
            token.range![0] + 2,
            token.range![1],
          );
        },
        range: token.range,
        loc: convertSourceLocationFromMomoaToJsonc(token.loc),
      };
    },
    Boolean(token) {
      return createStandardToken("Keyword", token);
    },
    Null(token) {
      return createStandardToken("Keyword", token);
    },
    Identifier(token) {
      return createStandardToken("Identifier", token);
    },
    Infinity(token) {
      const raw = momoaSourceCode.text.slice(...token.range!);
      if (raw.startsWith("-") || raw.startsWith("+")) {
        return [
          createPunctuator(raw[0], {
            range: [token.range![0], token.range![0] + 1],
            loc: {
              start: token.loc.start,
              end: {
                line: token.loc.start.line,
                column: token.loc.start.column + 1,
              },
            },
          }),
          createStandardToken("Identifier", {
            range: [token.range![0] + 1, token.range![1]],
            loc: {
              start: {
                line: token.loc.start.line,
                column: token.loc.start.column + 1,
              },
              end: token.loc.end,
            },
          }),
        ];
      }
      return createStandardToken("Identifier", token);
    },
    NaN(token) {
      const raw = momoaSourceCode.text.slice(...token.range!);
      if (raw.startsWith("-") || raw.startsWith("+")) {
        return [
          createPunctuator(raw[0], {
            range: [token.range![0], token.range![0] + 1],
            loc: {
              start: token.loc.start,
              end: {
                line: token.loc.start.line,
                column: token.loc.start.column + 1,
              },
            },
          }),
          createStandardToken("Identifier", {
            range: [token.range![0] + 1, token.range![1]],
            loc: {
              start: {
                line: token.loc.start.line,
                column: token.loc.start.column + 1,
              },
              end: token.loc.end,
            },
          }),
        ];
      }
      return createStandardToken("Identifier", token);
    },
    Number(token) {
      const raw = momoaSourceCode.text.slice(...token.range!);
      if (raw.startsWith("-") || raw.startsWith("+")) {
        return [
          createPunctuator(raw[0], {
            range: [token.range![0], token.range![0] + 1],
            loc: {
              start: token.loc.start,
              end: {
                line: token.loc.start.line,
                column: token.loc.start.column + 1,
              },
            },
          }),
          createStandardToken("Numeric", {
            range: [token.range![0] + 1, token.range![1]],
            loc: {
              start: {
                line: token.loc.start.line,
                column: token.loc.start.column + 1,
              },
              end: token.loc.end,
            },
          }),
        ];
      }
      return createStandardToken("Numeric", token);
    },
    String(token) {
      return createStandardToken("String", token);
    },
    Colon(token) {
      return createPunctuator(":", token);
    },
    Comma(token) {
      return createPunctuator(",", token);
    },
    LBracket(token) {
      return createPunctuator("[", token);
    },
    LBrace(token) {
      return createPunctuator("{", token);
    },
    RBracket(token) {
      return createPunctuator("]", token);
    },
    RBrace(token) {
      return createPunctuator("}", token);
    },
  };
  TOKEN_CONVERTERS.set(momoaSourceCode.ast, convertToken);
  return convertToken;

  /**
   * Create a token.
   */
  function createStandardToken(
    type: JSONToken["type"],
    token: { range?: [number, number]; loc: AST.SourceLocation },
  ): JSONToken {
    return {
      type,
      get value() {
        return momoaSourceCode.text.slice(...token.range!);
      },
      range: token.range!,
      loc: convertSourceLocationFromMomoaToJsonc(token.loc),
    };
  }

  /**
   * Create a punctuator token.
   */
  function createPunctuator(
    value: string,
    token: { range?: [number, number]; loc: AST.SourceLocation },
  ): JSONToken {
    return {
      type: "Punctuator",
      value,
      range: token.range!,
      loc: convertSourceLocationFromMomoaToJsonc(token.loc),
    };
  }

  /**
   * Convert the given momoa token to a JSONC token.
   */
  function convertToken(token: MomoaToken): JSONToken | JSONToken[] {
    if (convertedTokens.has(token)) {
      return convertedTokens.get(token)!;
    }

    const newToken = tokenConverters[token.type](token);
    convertedTokens.set(token, newToken);
    return newToken;
  }
}

/**
 * Convert the source location from Momoa to JSONC.
 */
function convertSourceLocationFromMomoaToJsonc(
  loc: AST.SourceLocation,
): AST.SourceLocation {
  return {
    start: convertPositionFromMomoaToJsonc(loc.start),
    end: convertPositionFromMomoaToJsonc(loc.end),
  };
}

/**
 * Convert the position from Momoa to JSONC.
 */
function convertPositionFromMomoaToJsonc(position: AST.Position): AST.Position {
  return {
    line: position.line,
    column: position.column - 1,
  };
}

/**
 * Convert the source location from JSONC to Momoa.
 */
function convertSourceLocationFromJsoncToMomoa(
  loc: AST.SourceLocation,
): AST.SourceLocation {
  return {
    start: convertPositionFromJsoncToMomoa(loc.start),
    end: convertPositionFromJsoncToMomoa(loc.end),
  };
}

/**
 * Convert the position from JSONC to Momoa.
 */
function convertPositionFromJsoncToMomoa(position: AST.Position): AST.Position {
  return {
    line: position.line,
    column: position.column + 1,
  };
}
