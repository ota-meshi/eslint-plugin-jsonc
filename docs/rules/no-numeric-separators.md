---
pageClass: "rule-details"
sidebarDepth: 0
title: "jsonc/no-numeric-separators"
description: "disallow numeric separators"
---
# jsonc/no-numeric-separators

> disallow numeric separators

- :gear: This rule is included in all of `"plugin:jsonc/recommended-with-json"`, `"plugin:jsonc/recommended-with-json5"` and `"plugin:jsonc/recommended-with-jsonc"`.
- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule reports the use of numeric separators.


<eslint-code-block fix>

```json5
/* eslint jsonc/no-numeric-separators: 'error' */
{
    /* ✓ GOOD */
    "GOOD": 1234567890,

    /* ✗ BAD */
    "BAD": 1_234_567_890
}
```

</eslint-code-block>

## :wrench: Options

Nothing.

## Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/lib/rules/no-numeric-separators.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/tests/lib/rules/no-numeric-separators.js)
