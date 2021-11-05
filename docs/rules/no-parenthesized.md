---
pageClass: "rule-details"
sidebarDepth: 0
title: "jsonc/no-parenthesized"
description: "disallow parentheses around the expression"
since: "v2.0.0"
---
# jsonc/no-parenthesized

> disallow parentheses around the expression

- :gear: This rule is included in all of `"plugin:jsonc/recommended-with-json"`, `"plugin:jsonc/recommended-with-json5"` and `"plugin:jsonc/recommended-with-jsonc"`.
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

## :rocket: Version

This rule was introduced in eslint-plugin-jsonc v2.0.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/lib/rules/no-parenthesized.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/tests/lib/rules/no-parenthesized.ts)
