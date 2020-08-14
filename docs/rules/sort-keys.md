---
pageClass: "rule-details"
sidebarDepth: 0
title: "jsonc/sort-keys"
description: "require object keys to be sorted"
---
# jsonc/sort-keys

> require object keys to be sorted

- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule checks all property definitions of object expressions and verifies that all variables are sorted alphabetically.

<eslint-code-block fix>

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

Same as [sort-keys] rule option. See [here](https://eslint.org/docs/rules/sort-keys#options) for details. 

## :couple: Related rules

- [sort-keys]

[sort-keys]: https://eslint.org/docs/rules/sort-keys

## Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/lib/rules/sort-keys.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/tests/lib/rules/sort-keys.js)

<sup>Taken with ❤️ [from ESLint core](https://eslint.org/docs/rules/sort-keys)</sup>
