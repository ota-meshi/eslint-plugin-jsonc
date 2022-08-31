import naturalCompare from "natural-compare";
import { createRule } from "../utils";
import { isCommaToken } from "eslint-utils";
import type { AST } from "jsonc-eslint-parser";
import { getStaticJSONValue } from "jsonc-eslint-parser";

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

type UserOptions = CompatibleWithESLintOptions | PatternOption[];

type OrderTypeOption = "asc" | "desc";
type CompatibleWithESLintOptions =
  | []
  | [OrderTypeOption]
  | [
      OrderTypeOption,
      {
        caseSensitive?: boolean;
        natural?: boolean;
        minKeys?: number;
      }
    ];
type PatternOption = {
  pathPattern: string;
  hasProperties: string[];
  order:
    | OrderObject
    | (
        | string
        | {
            keyPattern?: string;
            order?: OrderObject;
          }
      )[];
  minKeys?: number;
};
type OrderObject = {
  type?: OrderTypeOption;
  caseSensitive?: boolean;
  natural?: boolean;
};
type ParsedOption = {
  isTargetObject: (node: JSONObjectData) => boolean;
  ignore: (data: JSONPropertyData) => boolean;
  isValidOrder: Validator;
  orderText: string;
};
type Validator = (a: JSONPropertyData, b: JSONPropertyData) => boolean;

/**
 * Gets the property name of the given `Property` node.
 */
function getPropertyName(node: AST.JSONProperty): string {
  const prop = node.key;
  if (prop.type === "JSONIdentifier") {
    return prop.name;
  }
  return String(getStaticJSONValue(prop));
}

class JSONPropertyData {
  public readonly object: JSONObjectData;

  public readonly node: AST.JSONProperty;

  public readonly index: number;

  private cachedName: string | null = null;

  public get reportLoc() {
    return this.node.key.loc;
  }

  public constructor(
    object: JSONObjectData,
    node: AST.JSONProperty,
    index: number
  ) {
    this.object = object;
    this.node = node;
    this.index = index;
  }

  public get name() {
    return (this.cachedName ??= getPropertyName(this.node));
  }
}
class JSONObjectData {
  public readonly node: AST.JSONObjectExpression;

  private cachedProperties: JSONPropertyData[] | null = null;

  public constructor(node: AST.JSONObjectExpression) {
    this.node = node;
  }

  public get properties() {
    return (this.cachedProperties ??= this.node.properties.map(
      (e, index) => new JSONPropertyData(this, e, index)
    ));
  }
}

/**
 * Check if given options are CompatibleWithESLintOptions
 */
function isCompatibleWithESLintOptions(
  options: UserOptions
): options is CompatibleWithESLintOptions {
  if (options.length === 0) {
    return true;
  }
  if (typeof options[0] === "string" || options[0] == null) {
    return true;
  }

  return false;
}

/**
 * Build function which check that the given 2 names are in specific order.
 */
function buildValidatorFromType(
  order: OrderTypeOption,
  insensitive: boolean,
  natural: boolean
): Validator {
  let compare = natural
    ? ([a, b]: string[]) => naturalCompare(a, b) <= 0
    : ([a, b]: string[]) => a <= b;
  if (insensitive) {
    const baseCompare = compare;
    compare = ([a, b]: string[]) =>
      baseCompare([a.toLowerCase(), b.toLowerCase()]);
  }
  if (order === "desc") {
    const baseCompare = compare;
    compare = (args: string[]) => baseCompare(args.reverse());
  }
  return (a: JSONPropertyData, b: JSONPropertyData) =>
    compare([a.name, b.name]);
}

/**
 * Parse options
 */
function parseOptions(options: UserOptions): ParsedOption[] {
  if (isCompatibleWithESLintOptions(options)) {
    const type: OrderTypeOption = options[0] ?? "asc";
    const obj = options[1] ?? {};
    const insensitive = obj.caseSensitive === false;
    const natural = Boolean(obj.natural);
    const minKeys: number = obj.minKeys ?? 2;
    return [
      {
        isTargetObject: (node) => node.properties.length >= minKeys,
        ignore: () => false,
        isValidOrder: buildValidatorFromType(type, insensitive, natural),
        orderText: `${natural ? "natural " : ""}${
          insensitive ? "insensitive " : ""
        }${type}ending`,
      },
    ];
  }

  return options.map((opt) => {
    const order = opt.order;
    const pathPattern = new RegExp(opt.pathPattern);
    const hasProperties = opt.hasProperties ?? [];
    const minKeys: number = opt.minKeys ?? 2;
    if (!Array.isArray(order)) {
      const type: OrderTypeOption = order.type ?? "asc";
      const insensitive = order.caseSensitive === false;
      const natural = Boolean(order.natural);

      return {
        isTargetObject,
        ignore: () => false,
        isValidOrder: buildValidatorFromType(type, insensitive, natural),
        orderText: `${natural ? "natural " : ""}${
          insensitive ? "insensitive " : ""
        }${type}ending`,
      };
    }
    const parsedOrder: {
      test: (data: JSONPropertyData) => boolean;
      isValidNestOrder: Validator;
    }[] = [];
    for (const o of order) {
      if (typeof o === "string") {
        parsedOrder.push({
          test: (data) => data.name === o,
          isValidNestOrder: () => true,
        });
      } else {
        const keyPattern = o.keyPattern ? new RegExp(o.keyPattern) : null;
        const nestOrder = o.order ?? {};
        const type: OrderTypeOption = nestOrder.type ?? "asc";
        const insensitive = nestOrder.caseSensitive === false;
        const natural = Boolean(nestOrder.natural);
        parsedOrder.push({
          test: (data) => (keyPattern ? keyPattern.test(data.name) : true),
          isValidNestOrder: buildValidatorFromType(type, insensitive, natural),
        });
      }
    }
    return {
      isTargetObject,
      ignore: (data) => parsedOrder.every((p) => !p.test(data)),
      isValidOrder(a, b) {
        for (const p of parsedOrder) {
          const matchA = p.test(a);
          const matchB = p.test(b);
          if (!matchA || !matchB) {
            if (matchA) {
              return true;
            }
            if (matchB) {
              return false;
            }
            continue;
          }
          return p.isValidNestOrder(a, b);
        }
        return false;
      },
      orderText: "specified",
    };

    /**
     * Checks whether given node is verify target
     */
    function isTargetObject(data: JSONObjectData) {
      if (data.node.properties.length < minKeys) {
        return false;
      }
      if (hasProperties.length > 0) {
        const names = new Set(data.properties.map((p) => p.name));
        if (!hasProperties.every((name) => names.has(name))) {
          return false;
        }
      }

      let path = "";
      let curr: AST.JSONNode = data.node;
      let p: AST.JSONNode | null = curr.parent;
      while (p) {
        if (p.type === "JSONProperty") {
          const name = getPropertyName(p);
          if (/^[$_a-z][\w$]*$/iu.test(name)) {
            path = `.${name}${path}`;
          } else {
            path = `[${JSON.stringify(name)}]${path}`;
          }
        } else if (p.type === "JSONArrayExpression") {
          const index = p.elements.indexOf(curr as never);
          path = `[${index}]${path}`;
        }
        curr = p;
        p = curr.parent;
      }
      if (path.startsWith(".")) {
        path = path.slice(1);
      }
      return pathPattern.test(path);
    }
  });
}

const ALLOW_ORDER_TYPES: OrderTypeOption[] = ["asc", "desc"];
const ORDER_OBJECT_SCHEMA = {
  type: "object",
  properties: {
    type: {
      enum: ALLOW_ORDER_TYPES,
    },
    caseSensitive: {
      type: "boolean",
    },
    natural: {
      type: "boolean",
    },
  },
  additionalProperties: false,
} as const;

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

export default createRule("sort-keys", {
  meta: {
    docs: {
      description: "require object keys to be sorted",
      recommended: null,
      extensionRule: false,
      layout: false,
    },
    fixable: "code",
    schema: {
      oneOf: [
        {
          type: "array",
          items: {
            type: "object",
            properties: {
              pathPattern: { type: "string" },
              hasProperties: {
                type: "array",
                items: { type: "string" },
              },
              order: {
                oneOf: [
                  {
                    type: "array",
                    items: {
                      anyOf: [
                        { type: "string" },
                        {
                          type: "object",
                          properties: {
                            keyPattern: {
                              type: "string",
                            },
                            order: ORDER_OBJECT_SCHEMA,
                          },
                          additionalProperties: false,
                        },
                      ],
                    },
                    uniqueItems: true,
                  },
                  ORDER_OBJECT_SCHEMA,
                ],
              },
              minKeys: {
                type: "integer",
                minimum: 2,
              },
            },
            required: ["pathPattern", "order"],
            additionalProperties: false,
          },
          minItems: 1,
        },
        // For options compatible with the ESLint core.
        {
          type: "array",
          items: [
            {
              enum: ALLOW_ORDER_TYPES,
            },
            {
              type: "object",
              properties: {
                caseSensitive: {
                  type: "boolean",
                },
                natural: {
                  type: "boolean",
                },
                minKeys: {
                  type: "integer",
                  minimum: 2,
                },
              },
              additionalProperties: false,
            },
          ],
          additionalItems: false,
        },
      ],
    },

    messages: {
      sortKeys:
        "Expected object keys to be in {{orderText}} order. '{{thisName}}' should be before '{{prevName}}'.",
    },
    type: "suggestion",
  },
  create(context) {
    if (!context.parserServices.isJSON) {
      return {};
    }
    // Parse options.
    const parsedOptions = parseOptions(context.options);

    /**
     * Verify for property
     */
    function verifyProperty(data: JSONPropertyData, option: ParsedOption) {
      if (option.ignore(data)) {
        return;
      }
      const prevList = data.object.properties
        .slice(0, data.index)
        .reverse()
        .filter((d) => !option.ignore(d));

      if (prevList.length === 0) {
        return;
      }
      const prev = prevList[0];
      if (!option.isValidOrder(prev, data)) {
        context.report({
          loc: data.reportLoc,
          messageId: "sortKeys",
          data: {
            thisName: data.name,
            prevName: prev.name,
            orderText: option.orderText,
          },
          *fix(fixer) {
            const sourceCode = context.getSourceCode();
            let moveTarget = prevList[0];
            for (const prev of prevList) {
              if (option.isValidOrder(prev, data)) {
                break;
              } else {
                moveTarget = prev;
              }
            }

            const beforeToken = sourceCode.getTokenBefore(data.node as never)!;
            const afterToken = sourceCode.getTokenAfter(data.node as never)!;
            const hasAfterComma = isCommaToken(afterToken);
            const codeStart = beforeToken.range[1]; // to include comments
            const codeEnd = hasAfterComma
              ? afterToken.range[1] // |/**/ key: value,|
              : data.node.range[1]; // |/**/ key: value|
            const removeStart = hasAfterComma
              ? codeStart // |/**/ key: value,|
              : beforeToken.range[0]; // |,/**/ key: value|

            const insertCode =
              sourceCode.text.slice(codeStart, codeEnd) +
              (hasAfterComma ? "" : ",");

            const insertTarget = sourceCode.getTokenBefore(
              moveTarget.node as never
            )!;
            yield fixer.insertTextAfterRange(insertTarget.range, insertCode);

            yield fixer.removeRange([removeStart, codeEnd]);
          },
        });
      }
    }

    return {
      JSONObjectExpression(node: AST.JSONObjectExpression) {
        const data = new JSONObjectData(node);
        const option = parsedOptions.find((o) => o.isTargetObject(data));
        if (!option) {
          return;
        }
        for (const prop of data.properties) {
          verifyProperty(prop, option);
        }
      },
    };
  },
});
