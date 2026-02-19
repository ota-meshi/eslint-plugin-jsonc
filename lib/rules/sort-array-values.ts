import naturalCompare from "natural-compare";
import { createRule } from "../utils/index.ts";
import type { AST } from "jsonc-eslint-parser";
import { getStaticJSONValue } from "jsonc-eslint-parser";
import type { SourceCode } from "eslint";
import type { AroundTarget } from "../utils/fix-sort-elements.ts";
import {
  fixToMoveDownForSorting,
  fixToMoveUpForSorting,
} from "../utils/fix-sort-elements.ts";
import { calcShortestEditScript } from "../utils/calc-shortest-edit-script.ts";

type JSONValue = ReturnType<typeof getStaticJSONValue>;

//------------------------------------------------------------------------------
// Helpers
//------------------------------------------------------------------------------

type UserOptions = PatternOption[];
type OrderTypeOption = "asc" | "desc";
type PatternOption = {
  pathPattern: string;
  order:
    | OrderObject
    | (
        | string
        | {
            valuePattern?: string;
            order?: OrderObject;
          }
      )[];
  minValues?: number;
};
type OrderObject = {
  type?: OrderTypeOption;
  caseSensitive?: boolean;
  natural?: boolean;
};
type ParsedOption = {
  isTargetArray: (node: JSONArrayData) => boolean;
  ignore: (data: JSONElementData) => boolean;
  isValidOrder: Validator;
  orderText: (data: JSONElementData) => string;
};
type Validator = (a: JSONElementData, b: JSONElementData) => boolean;

type JSONElement = AST.JSONArrayExpression["elements"][number];
class JSONElementData {
  public readonly array: JSONArrayData;

  public readonly node: JSONElement;

  public readonly index: number;

  private cached: { value: JSONValue } | null = null;

  private cachedAround: AroundTarget | null = null;

  public get reportLoc() {
    if (this.node) {
      return this.node.loc;
    }
    const around = this.around;
    return {
      start: around.before.loc.end,
      end: around.after.loc.start,
    };
  }

  public get around(): AroundTarget {
    if (this.cachedAround) {
      return this.cachedAround;
    }
    const sourceCode = this.array.sourceCode;
    if (this.node) {
      return (this.cachedAround = {
        node: this.node,
        before: sourceCode.getTokenBefore(this.node as never)!,
        after: sourceCode.getTokenAfter(this.node as never)!,
      });
    }
    const before =
      this.index > 0
        ? this.array.elements[this.index - 1].around.after
        : sourceCode.getFirstToken(this.array.node as never)!;
    const after = sourceCode.getTokenAfter(before)!;
    return (this.cachedAround = { before, after });
  }

  public constructor(array: JSONArrayData, node: JSONElement, index: number) {
    this.array = array;
    this.node = node;
    this.index = index;
  }

  public get value() {
    return (
      this.cached ??
      (this.cached = {
        value: this.node == null ? null : getStaticJSONValue(this.node),
      })
    ).value;
  }
}
class JSONArrayData {
  public readonly node: AST.JSONArrayExpression;

  public readonly sourceCode: SourceCode;

  private cachedElements: JSONElementData[] | null = null;

  public constructor(node: AST.JSONArrayExpression, sourceCode: SourceCode) {
    this.node = node;
    this.sourceCode = sourceCode;
  }

  public get elements() {
    return (this.cachedElements ??= this.node.elements.map(
      (e, index) => new JSONElementData(this, e, index),
    ));
  }
}

/**
 * Build function which check that the given 2 names are in specific order.
 */
function buildValidatorFromType(
  order: OrderTypeOption,
  insensitive: boolean,
  natural: boolean,
): Validator {
  type Compare<T> = ([a, b]: T[]) => boolean;

  let compareValue: Compare<any> = ([a, b]) => a <= b;
  let compareText: Compare<string> = compareValue;

  if (natural) {
    compareText = ([a, b]) => naturalCompare(a, b) <= 0;
  }
  if (insensitive) {
    const baseCompareText = compareText;
    compareText = ([a, b]: string[]) =>
      baseCompareText([a.toLowerCase(), b.toLowerCase()]);
  }
  if (order === "desc") {
    const baseCompareText = compareText;
    compareText = (args: string[]) => baseCompareText(args.reverse());
    const baseCompareValue = compareValue;
    compareValue = (args) => baseCompareValue(args.reverse());
  }
  return (a: JSONElementData, b: JSONElementData) => {
    if (typeof a.value === "string" && typeof b.value === "string") {
      return compareText([a.value, b.value]);
    }
    const type = getJSONPrimitiveType(a.value);
    if (type && type === getJSONPrimitiveType(b.value)) {
      return compareValue([a.value, b.value]);
    }
    // Unknown
    return true;
  };
}

/**
 * Parse options
 */
function parseOptions(options: UserOptions): ParsedOption[] {
  return options.map((opt) => {
    const order = opt.order;
    const pathPattern = new RegExp(opt.pathPattern);
    const minValues: number = opt.minValues ?? 2;
    if (!Array.isArray(order)) {
      const type: OrderTypeOption = order.type ?? "asc";
      const insensitive = order.caseSensitive === false;
      const natural = Boolean(order.natural);

      return {
        isTargetArray,
        ignore: () => false,
        isValidOrder: buildValidatorFromType(type, insensitive, natural),
        orderText(data) {
          if (typeof data.value === "string") {
            return `${natural ? "natural " : ""}${
              insensitive ? "insensitive " : ""
            }${type}ending`;
          }
          return `${type}ending`;
        },
      };
    }
    const parsedOrder: {
      test: (v: JSONElementData) => boolean;
      isValidNestOrder: Validator;
    }[] = [];
    for (const o of order) {
      if (typeof o === "string") {
        parsedOrder.push({
          test: (v) => v.value === o,
          isValidNestOrder: () => true,
        });
      } else {
        const valuePattern = o.valuePattern ? new RegExp(o.valuePattern) : null;
        const nestOrder = o.order ?? {};
        const type: OrderTypeOption = nestOrder.type ?? "asc";
        const insensitive = nestOrder.caseSensitive === false;
        const natural = Boolean(nestOrder.natural);
        parsedOrder.push({
          test: (v) =>
            valuePattern
              ? Boolean(getJSONPrimitiveType(v.value)) &&
                valuePattern.test(String(v.value))
              : true,
          isValidNestOrder: buildValidatorFromType(type, insensitive, natural),
        });
      }
    }

    return {
      isTargetArray,
      ignore: (v) => parsedOrder.every((p) => !p.test(v)),
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
      orderText: () => "specified",
    };

    /**
     * Checks whether given node data is verify target
     */
    function isTargetArray(data: JSONArrayData) {
      if (data.node.elements.length < minValues) {
        return false;
      }

      // Check whether the path is match or not.
      let path = "";
      let curr: AST.JSONNode = data.node;
      let p: AST.JSONNode | null = curr.parent;
      while (p) {
        if (p.type === "JSONProperty") {
          const name = getPropertyName(p);
          if (/^[$a-z_][\w$]*$/iu.test(name)) {
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
}

/**
 * Get the type name from given value when value is primitive like value
 */
function getJSONPrimitiveType(val: JSONValue) {
  const t = typeof val;
  if (t === "string" || t === "number" || t === "boolean" || t === "bigint") {
    return t;
  }
  if (val === null) {
    return "null";
  }
  if (val === undefined) {
    return "undefined";
  }
  if (val instanceof RegExp) {
    return "regexp";
  }
  return null;
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

export default createRule<UserOptions>("sort-array-values", {
  meta: {
    docs: {
      description: "require array values to be sorted",
      recommended: null,
      extensionRule: false,
      layout: false,
    },
    fixable: "code",
    schema: {
      type: "array",
      items: {
        type: "object",
        properties: {
          pathPattern: { type: "string" },
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
                        valuePattern: {
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
          minValues: {
            type: "integer",
            minimum: 2,
          },
        },
        required: ["pathPattern", "order"],
        additionalProperties: false,
      },
      minItems: 1,
    },

    messages: {
      shouldBeBefore:
        "Expected array values to be in {{orderText}} order. '{{thisValue}}' should be before '{{targetValue}}'.",
      shouldBeAfter:
        "Expected array values to be in {{orderText}} order. '{{thisValue}}' should be after '{{targetValue}}'.",
    },
    type: "suggestion",
  },
  create(context) {
    const sourceCode = context.sourceCode;
    if (!sourceCode.parserServices.isJSON) {
      return {};
    }
    // Parse options.
    const parsedOptions = parseOptions(context.options);

    /**
     * Sort elements by bubble sort.
     */
    function bubbleSort(elements: JSONElementData[], option: ParsedOption) {
      const l = elements.length;
      const result = [...elements];
      let swapped: boolean;
      do {
        swapped = false;
        for (let nextIndex = 1; nextIndex < l; nextIndex++) {
          const prevIndex = nextIndex - 1;
          if (option.isValidOrder(result[prevIndex], result[nextIndex]))
            continue;
          [result[prevIndex], result[nextIndex]] = [
            result[nextIndex],
            result[prevIndex],
          ];
          swapped = true;
        }
      } while (swapped);
      return result;
    }

    /**
     * Verify for array elements
     */
    function verifyArrayElements(
      elements: JSONElementData[],
      option: ParsedOption,
    ) {
      const sorted = bubbleSort(elements, option);
      const editScript = calcShortestEditScript(elements, sorted);
      for (let index = 0; index < editScript.length; index++) {
        const edit = editScript[index];
        if (edit.type !== "delete") continue;
        const insertEditIndex = editScript.findIndex(
          (e) => e.type === "insert" && e.b === edit.a,
        );
        if (insertEditIndex === -1) {
          // should not happen
          continue;
        }
        if (index < insertEditIndex) {
          const target = findInsertAfterTarget(edit.a, insertEditIndex);
          if (!target) {
            // should not happen
            continue;
          }
          context.report({
            loc: edit.a.reportLoc,
            messageId: "shouldBeAfter",
            data: {
              thisValue: toText(edit.a),
              targetValue: toText(target),
              orderText: option.orderText(edit.a),
            },
            *fix(fixer) {
              yield* fixToMoveDownForSorting(
                fixer,
                sourceCode,
                edit.a.around,
                target.around,
              );
            },
          });
        } else {
          const target = findInsertBeforeTarget(edit.a, insertEditIndex);
          if (!target) {
            // should not happen
            continue;
          }
          context.report({
            loc: edit.a.reportLoc,
            messageId: "shouldBeBefore",
            data: {
              thisValue: toText(edit.a),
              targetValue: toText(target),
              orderText: option.orderText(edit.a),
            },
            *fix(fixer) {
              yield* fixToMoveUpForSorting(
                fixer,
                sourceCode,
                edit.a.around,
                target.around,
              );
            },
          });
        }
      }

      /**
       * Find insert after target
       */
      function findInsertAfterTarget(
        element: JSONElementData,
        insertEditIndex: number,
      ) {
        for (let index = insertEditIndex - 1; index >= 0; index--) {
          const edit = editScript[index];
          if (edit.type === "delete" && edit.a === element) break;
          if (edit.type !== "common") continue;
          return edit.a;
        }

        let lastTarget: JSONElementData | null = null;
        for (
          let index = elements.indexOf(element) + 1;
          index < elements.length;
          index++
        ) {
          const el = elements[index];
          if (option.isValidOrder(el, element)) {
            lastTarget = el;
            continue;
          }
          return lastTarget;
        }
        return lastTarget;
      }

      /**
       * Find insert before target
       */
      function findInsertBeforeTarget(
        element: JSONElementData,
        insertEditIndex: number,
      ) {
        for (
          let index = insertEditIndex + 1;
          index < editScript.length;
          index++
        ) {
          const edit = editScript[index];
          if (edit.type === "delete" && edit.a === element) break;
          if (edit.type !== "common") continue;
          return edit.a;
        }

        let lastTarget: JSONElementData | null = null;
        for (let index = elements.indexOf(element) - 1; index >= 0; index--) {
          const el = elements[index];
          if (option.isValidOrder(element, el)) {
            lastTarget = el;
            continue;
          }
          return lastTarget;
        }
        return lastTarget;
      }
    }

    /**
     * Convert to display text.
     */
    function toText(data: JSONElementData) {
      if (getJSONPrimitiveType(data.value)) {
        return String(data.value);
      }
      return sourceCode.getText(data.node! as never);
    }

    return {
      JSONArrayExpression(node) {
        const data = new JSONArrayData(node, sourceCode);
        const option = parsedOptions.find((o) => o.isTargetArray(data));
        if (!option) {
          return;
        }
        verifyArrayElements(
          data.elements.filter((d) => !option.ignore(d)),
          option,
        );
      },
    };
  },
});
