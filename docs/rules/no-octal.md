---
pageClass: "rule-details"
sidebarDepth: 0
title: "jsonc/no-octal"
description: "disallow legacy octal literals"
since: "v1.1.0"
---
# jsonc/no-octal

> disallow legacy octal literals

- :gear: This rule is included in all of `"plugin:jsonc/recommended-with-json"`, `"plugin:jsonc/recommended-with-json5"` and `"plugin:jsonc/recommended-with-jsonc"`.

## :book: Rule Details

The rule disallows legacy octal literals.

<eslint-code-block>

<!-- eslint-skip -->

```json5
/* eslint jsonc/no-octal: 'error' */
{
    /* ✓ GOOD */
    "GOOD": 777,

    /* ✗ BAD */
    "BAD": 0777
}
```

</eslint-code-block>

## :wrench: Options

Nothing.

## :couple: Related rules

- [no-octal]
- [jsonc/valid-json-number]

[no-octal]: https://eslint.org/docs/rules/no-octal
[jsonc/valid-json-number]: ./valid-json-number.md

## :rocket: Version

This rule was introduced in eslint-plugin-jsonc v1.1.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/lib/rules/no-octal.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/tests/lib/rules/no-octal.ts)

<sup>Taken with ❤️ [from ESLint core](https://eslint.org/docs/rules/no-octal)</sup>
