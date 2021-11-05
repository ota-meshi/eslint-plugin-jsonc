---
pageClass: "rule-details"
sidebarDepth: 0
title: "jsonc/no-hexadecimal-numeric-literals"
description: "disallow hexadecimal numeric literals"
since: "v1.1.0"
---
# jsonc/no-hexadecimal-numeric-literals

> disallow hexadecimal numeric literals

- :gear: This rule is included in `"plugin:jsonc/recommended-with-json"` and `"plugin:jsonc/recommended-with-jsonc"`.
- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule disallow hexadecimal numeric literals.

Cannot use hexadecimal numeric literals when in JSON and JSONC.

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

## :couple: Related rules

- [jsonc/valid-json-number]

[jsonc/valid-json-number]: ./valid-json-number.md

## :rocket: Version

This rule was introduced in eslint-plugin-jsonc v1.1.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/lib/rules/no-hexadecimal-numeric-literals.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/tests/lib/rules/no-hexadecimal-numeric-literals.ts)
