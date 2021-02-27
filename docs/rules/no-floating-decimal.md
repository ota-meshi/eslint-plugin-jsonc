---
pageClass: "rule-details"
sidebarDepth: 0
title: "jsonc/no-floating-decimal"
description: "disallow leading or trailing decimal points in numeric literals"
since: "v0.9.0"
---
# jsonc/no-floating-decimal

> disallow leading or trailing decimal points in numeric literals

- :gear: This rule is included in `"plugin:jsonc/recommended-with-json"` and `"plugin:jsonc/recommended-with-jsonc"`.
- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule is aimed at eliminating floating decimal points and will warn whenever a numeric value has a decimal point but is missing a number either before or after it.

Cannot use floating decimal points when in JSON and JSONC.

<eslint-code-block fix>

<!-- eslint-skip -->

```json5
/* eslint jsonc/no-floating-decimal: 'error' */
{
    /* ✓ GOOD */
    "GOOD": 42.0,

    /* ✗ BAD */
    "BAD": 42.
}
```

</eslint-code-block>

## :wrench: Options

Nothing.

## :couple: Related rules

- [no-floating-decimal]
- [jsonc/valid-json-number]

[no-floating-decimal]: https://eslint.org/docs/rules/no-floating-decimal
[jsonc/valid-json-number]: ./valid-json-number.md

## :rocket: Version

This rule was introduced in eslint-plugin-jsonc v0.9.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/lib/rules/no-floating-decimal.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/tests/lib/rules/no-floating-decimal.ts)

<sup>Taken with ❤️ [from ESLint core](https://eslint.org/docs/rules/no-floating-decimal)</sup>
