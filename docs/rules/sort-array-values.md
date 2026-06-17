---
pageClass: "rule-details"
sidebarDepth: 0
title: "jsonc/sort-array-values"
description: "require array values to be sorted"
since: "v2.2.0"
---

# jsonc/sort-array-values

> require array values to be sorted

- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule checks values of array and verifies that values are sorted alphabetically or specified order.

<eslint-code-block fix>

<!-- eslint-skip -->

```json5
/* eslint jsonc/sort-array-values: ['error', { pathPattern: '.*', order: { type: 'asc' } }] */
{
    /* ✓ GOOD */
    "GOOD": ["a", "b", "c"],

    /* ✗ BAD */
    "BAD": ["c", "b", "a"]
}
```

</eslint-code-block>

## :wrench: Options

```json5
{
    "jsonc/sort-array-values": ["error", 
        {
            "pathPattern": "^files$",  // Hits the files property
            "order": { "type": "asc" }
        },
        {
            "pathPattern": "^keywords$", // Hits the keywords property
            "order": [
                "eslint",
                "eslintplugin",
                "eslint-plugin",
                {
                    // Fallback order
                    "order": { "type": "asc" }
                }
            ]
        },
        {
            "pathPattern": "^categories\\.\\w+$", // Hits arrays of objects
            // Sort each array of objects by its "name" property
            "order": { "type": "asc", "key": "name" }
        },
        {
            "pathPattern": "^items$",
            "order": [
                {
                    // Sort object elements by their "name" property
                    "key": "name",
                    "order": { "type": "asc" }
                },
                {
                    // Sort any remaining values alphabetically
                    "order": { "type": "asc" }
                }
            ]
        }
    ]
}
```

The option receives multiple objects with the following properties:

- `pathPattern` (Required) ... Defines the regular expression pattern of paths to which you want to enforce the order. If you want to apply to the top level, define `"^$"`.
- `order` (Required) ... Defines how to enforce the order. You can use an object or an array.
  - Array ... Defines an array of values to enforce the order.
    - String ... Defines the value.
    - Object ... The object has the following properties:
      - `key` ... Compares object elements by the value of this property. Default is to compare the element value itself.
      - `valuePattern` ... Defines a pattern to match the value, or the value at `key` when `key` is set. Default is to match all.
      - `order` ... The object has the following properties:
        - `type`:
          - `"asc"` ... Enforce values to be in ascending order. This is default.
          - `"desc"` ... Enforce values to be in descending order.
        - `caseSensitive` ... If `true`, enforce values to be in case-sensitive order. Default is `true`.
        - `natural` ... If `true`, enforce values to be in natural order. Default is `false`.
  - Object ... The object has the following properties:
    - `type`:
      - `"asc"` ... Enforce values to be in ascending order. This is default.
      - `"desc"` ... Enforce values to be in descending order.
    - `caseSensitive` ... If `true`, enforce values to be in case-sensitive order. Default is `true`.
    - `natural` ... If `true`, enforce values to be in natural order. Default is `false`.
    - `key` ... Sorts an array of objects by the value of this property. Elements that lack the property are handled by `missingKey`. Default is to compare the element value itself.
    - `missingKey` ... Defines how to handle elements that lack the `key` property. Used only with `key`.
      - `"last"` ... Enforce such elements to be at the end of the array. This is default.
      - `"first"` ... Enforce such elements to be at the start of the array.
      - `"skip"` ... Ignore such elements when checking the order.
      - `"error"` ... Report such elements. These are not auto-fixed.
- `minValues` ... Specifies the minimum number of values that an array should have in order for the array's unsorted values to produce an error. Default is `2`, which means by default all arrays with unsorted values will result in lint errors.

## :couple: Related rules

- [jsonc/sort-keys]

[jsonc/sort-keys]: ./sort-keys.md

## :rocket: Version

This rule was introduced in eslint-plugin-jsonc v2.2.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/lib/rules/sort-array-values.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/tests/lib/rules/sort-array-values.ts)
