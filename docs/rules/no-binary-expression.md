---
pageClass: "rule-details"
sidebarDepth: 0
title: "jsonc/no-binary-expression"
description: "disallow binary expression"
since: "v2.0.0"
---
# jsonc/no-binary-expression

> disallow binary expression

- :gear: This rule is included in all of `"plugin:jsonc/recommended-with-json"`, `"plugin:jsonc/recommended-with-json5"` and `"plugin:jsonc/recommended-with-jsonc"`.
- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule disallow binary expressions.

<eslint-code-block fix>

<!-- eslint-skip -->

```json5
/* eslint jsonc/no-binary-expression: 'error' */
{
    /* ✓ GOOD */
    "GOOD": 86400,

    /* ✗ BAD */
    "BAD": 60 * 60 * 24
}
```

</eslint-code-block>

## :wrench: Options

Nothing.

## :rocket: Version

This rule was introduced in eslint-plugin-jsonc v2.0.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/lib/rules/no-binary-expression.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/tests/lib/rules/no-binary-expression.ts)
