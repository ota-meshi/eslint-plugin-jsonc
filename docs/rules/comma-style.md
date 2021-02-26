---
pageClass: "rule-details"
sidebarDepth: 0
title: "jsonc/comma-style"
description: "enforce consistent comma style"
since: "v0.1.0"
---
# jsonc/comma-style

> enforce consistent comma style

- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule enforce consistent comma style in array literals and object literals.

<eslint-code-block fix>

<!-- eslint-skip -->

```json5
/* eslint jsonc/comma-style: 'error' */
{
    /* ✓ GOOD */
    "GOOD": ["apples",
        "oranges"],
    "GOOD": {
        "a": 1,
        "b": 2
    },

    /* ✗ BAD */
    "BAD": ["apples"
        , "oranges"]
    ,"BAD": {
        "a": 1
        , "b": 2
    }
}
```

</eslint-code-block>

## :wrench: Options

```json
{
    "jsonc/comma-style": ["error",
        "last"
    ]
}
```

Same as [comma-style] rule option. See [here](https://eslint.org/docs/rules/comma-style#options) for details. 

## :couple: Related rules

- [comma-style]

[comma-style]: https://eslint.org/docs/rules/comma-style

## :rocket: Version

This rule was introduced in eslint-plugin-jsonc v0.1.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/lib/rules/comma-style.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/tests/lib/rules/comma-style.ts)

<sup>Taken with ❤️ [from ESLint core](https://eslint.org/docs/rules/comma-style)</sup>
