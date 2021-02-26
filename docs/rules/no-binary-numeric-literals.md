---
pageClass: "rule-details"
sidebarDepth: 0
title: "jsonc/no-binary-numeric-literals"
description: "disallow binary numeric literals"
---
# jsonc/no-binary-numeric-literals

> disallow binary numeric literals

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> ***This rule has not been released yet.*** </badge>
- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule disallow binary numeric literals

<eslint-code-block fix>

<!-- eslint-skip -->

```json5
/* eslint jsonc/no-binary-numeric-literals: 'error' */
{
    /* ✓ GOOD */
    "GOOD": 10,

    /* ✗ BAD */
    "BAD": 0b1010
}
```

</eslint-code-block>

## :wrench: Options

Nothing.

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/lib/rules/no-binary-numeric-literals.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/tests/lib/rules/no-binary-numeric-literals.js)
