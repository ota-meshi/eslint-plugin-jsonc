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
      - `key` ... Sorts arrays of objects by the value of this property. When set, the matcher targets object elements that have this property, and the value at `key` is used for comparison.
      - `valuePattern` ... Defines a pattern to match the value (or, when `key` is set, the value at `key`). Default is to match all.
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
    - `key` ... Sorts an array of objects by the value of this property. For example, `"key": "name"` sorts the array by each object's `name` value. Non-object elements (and objects missing the property) are handled by `missingKey`.
    - `missingKey` ... Controls how elements that lack the `key` property are handled. Only relevant when `key` is set.
      - `"last"` ... Such elements are expected at the end of the array. This is default.
      - `"first"` ... Such elements are expected at the start of the array.
      - `"skip"` ... Such elements are ignored when checking the order.
      - `"error"` ... Such elements are reported (without auto-fix), requiring every element to have the `key` property.
- `minValues` ... Specifies the minimum number of values that an array should have in order for the array's unsorted values to produce an error. Default is `2`, which means by default all arrays with unsorted values will result in lint errors.

## Sorting object arrays by property key

Use the `key` option to sort an array of objects by the value of a specific property.

<eslint-code-block fix>

<!-- eslint-skip -->

```json5
/* eslint jsonc/sort-array-values: ['error', { pathPattern: '^categories\\.\\w+$', order: { type: 'asc', key: 'name' } }] */
{
    "categories": {
        "fruits": [
            /* ✓ GOOD */
            { "name": "apple" },
            { "name": "banana" },
            { "name": "cherry" }
        ],
        "vegetables": [
            /* ✗ BAD */
            { "name": "carrot" },
            { "name": "broccoli" },
            { "name": "asparagus" }
        ]
    }
}
```

</eslint-code-block>

By default, elements that do not have the `key` property are expected at the end of the array (`missingKey: "last"`). Use `missingKey` to change this to `"first"`, `"skip"` (ignore ordering for those elements), or `"error"` (report any element missing the `key` property).

### Composing with the array form

The array-of-matchers form also accepts `key`, so you can mix object sorting with other rules. For example, sort objects by their `name` property while sorting any remaining values alphabetically:

```json5
{
    "jsonc/sort-array-values": ["error",
        {
            "pathPattern": "^items$",
            "order": [
                {
                    // Object elements are sorted by their `name` property
                    "key": "name",
                    "order": { "type": "asc" }
                },
                {
                    // Remaining (e.g. primitive) values are sorted alphabetically
                    "order": { "type": "asc" }
                }
            ]
        }
    ]
}
```

## :couple: Related rules

- [jsonc/sort-keys]

[jsonc/sort-keys]: ./sort-keys.md

## :rocket: Version

This rule was introduced in eslint-plugin-jsonc v2.2.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/lib/rules/sort-array-values.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/tests/lib/rules/sort-array-values.ts)
