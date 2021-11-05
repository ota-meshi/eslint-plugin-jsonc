---
pageClass: "rule-details"
sidebarDepth: 0
title: "jsonc/no-binary-numeric-literals"
description: "disallow binary numeric literals"
since: "v1.1.0"
---
# jsonc/no-binary-numeric-literals

> disallow binary numeric literals

- :gear: This rule is included in all of `"plugin:jsonc/recommended-with-json"`, `"plugin:jsonc/recommended-with-json5"` and `"plugin:jsonc/recommended-with-jsonc"`.
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

## :couple: Related rules

- [jsonc/valid-json-number]

[jsonc/valid-json-number]: ./valid-json-number.md

## :rocket: Version

This rule was introduced in eslint-plugin-jsonc v1.1.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/lib/rules/no-binary-numeric-literals.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/tests/lib/rules/no-binary-numeric-literals.ts)
