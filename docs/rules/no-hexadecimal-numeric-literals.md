---
pageClass: "rule-details"
sidebarDepth: 0
title: "jsonc/no-hexadecimal-numeric-literals"
description: "disallow hexadecimal numeric literals"
---
# jsonc/no-hexadecimal-numeric-literals

> disallow hexadecimal numeric literals

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> ***This rule has not been released yet.*** </badge>
- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule disallow hexadecimal numeric literals.

<eslint-code-block fix>

<!-- eslint-skip -->

```json5
/* eslint jsonc/no-hexadecimal-numeric-literals: 'error' */
{
    /* ✓ GOOD */
    "GOOD": 65535,

    /* ✗ BAD */
    "BAD": 0xFFFF
}
```

</eslint-code-block>

## :wrench: Options

Nothing.

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/lib/rules/no-hexadecimal-numeric-literals.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/tests/lib/rules/no-hexadecimal-numeric-literals.js)
