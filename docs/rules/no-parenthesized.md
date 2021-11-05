---
pageClass: "rule-details"
sidebarDepth: 0
title: "jsonc/no-parenthesized"
description: "disallow parentheses around the expression"
---
# jsonc/no-parenthesized

> disallow parentheses around the expression

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> ***This rule has not been released yet.*** </badge>
- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule always disallow parentheses around the expression.

<eslint-code-block fix>

<!-- eslint-skip -->

```json5
/* eslint jsonc/no-parenthesized: 'error' */
{
    /* ✓ GOOD */
    "GOOD": "foo",

    /* ✗ BAD */
    "BAD": ("bar")
}
```

</eslint-code-block>

## :wrench: Options

Nothing.

## :couple: Related rules

- [no-parenthesized]

[no-parenthesized]: https://eslint.org/docs/rules/no-parenthesized

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/lib/rules/no-parenthesized.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/tests/lib/rules/no-parenthesized.ts)
