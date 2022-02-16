---
pageClass: "rule-details"
sidebarDepth: 0
title: "jsonc/sort-keys"
description: "require object keys to be sorted"
since: "v0.1.0"
---
# jsonc/sort-keys

> require object keys to be sorted

- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule checks property definitions of object and verifies that all properties are sorted alphabetically or specified order.

<eslint-code-block fix>

<!-- eslint-skip -->

```json5
/* eslint jsonc/sort-keys: 'error' */
{
    /* ✓ GOOD */
    "a": {"a": 1, "b": 2, "c": 3},

    /* ✗ BAD */
    "b": {"a": 1, "c": 3, "b": 2}
}
```

</eslint-code-block>

## :wrench: Options

```json5
{
    "jsonc/sort-keys": ["error",
        // For example, a definition for package.json
        {
            "pathPattern": "^$", // Hits the root properties
            "order": [
                "name",
                "version",
                "private",
                "publishConfig"
                // ...
            ]
        },
        {
            "pathPattern": "^(?:dev|peer|optional|bundled)?[Dd]ependencies$",
            "order": { "type": "asc" }
        }
        // ...
    ]
}
```

```json5
{
    "jsonc/sort-keys": ["error",
        // For example, a definition for JSON Schema
        {
            "pathPattern": ".*", // Hits the all properties
            "hasProperties": ["type"],
            "order": [
                "type",
                "properties",
                "items",
                "required",
                "minItems",
                "additionalProperties",
                "additionalItems"
                // ...
            ]
        }
        // ...
    ]
}
```

The option receives multiple objects with the following properties:

- `pathPattern` (Required) ... Defines the regular expression pattern of paths to which you want to enforce the order. If you want to apply to the top level, define `"^$"`.
- `hasProperties` ... Defines an array of property names. Checks only objects that have the defined properties.
- `order` (Required) ... Defines how to enforce the order. You can use an object or an array.
  - Array ... Defines an array of properties to enforce the order.
    - String ... Defines the property name.
    - Object ... The object has the following properties:
      - `keyPattern` ... Defines a pattern to match the property name. Default is to match all.
      - `order` ... The object has the following properties:
        - `type`:
          - `"asc"` ... Enforce properties to be in ascending order. This is default.
          - `"desc"` ... Enforce properties to be in descending order.
        - `caseSensitive` ... If `true`, enforce properties to be in case-sensitive order. Default is `true`.
        - `natural` ... If `true`, enforce properties to be in natural order. Default is `false`.
  - Object ... The object has the following properties:
    - `type`:
      - `"asc"` ... Enforce properties to be in ascending order. This is default.
      - `"desc"` ... Enforce properties to be in descending order.
    - `caseSensitive` ... If `true`, enforce properties to be in case-sensitive order. Default is `true`.
    - `natural` ... If `true`, enforce properties to be in natural order. Default is `false`.
- `minKeys` ... Specifies the minimum number of keys that an object should have in order for the object's unsorted keys to produce an error. Default is `2`, which means by default all objects with unsorted keys will result in lint errors.

You can also define options in the same format as the [sort-keys] rule.

```json5
{
    "jsonc/sort-keys": ["error",
        "asc",
        {
            "caseSensitive": true,
            "natural": false,
            "minKeys": 2
        }
    ]
}
```

See [here](https://eslint.org/docs/rules/sort-keys#options) for details.

## :couple: Related rules

- [sort-keys]

[sort-keys]: https://eslint.org/docs/rules/sort-keys

## :rocket: Version

This rule was introduced in eslint-plugin-jsonc v0.1.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/lib/rules/sort-keys.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/tests/lib/rules/sort-keys.ts)
