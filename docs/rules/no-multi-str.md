---
pageClass: "rule-details"
sidebarDepth: 0
title: "jsonc/no-multi-str"
description: "disallow multiline strings"
since: "v0.1.0"
---
# jsonc/no-multi-str

> disallow multiline strings

- :gear: This rule is included in `"plugin:jsonc/recommended-with-json"` and `"plugin:jsonc/recommended-with-jsonc"`.

## :book: Rule Details

This rule is aimed at preventing the use of multiline strings.

<eslint-code-block>

<!-- eslint-skip -->

```json5
/* eslint jsonc/no-multi-str: 'error' */
{
    /* ✓ GOOD */
    "GOOD": "Line 1 \nLine 2",

    /* ✗ BAD */
    "BAD": "Line 1 \
Line 2",
}
```

</eslint-code-block>

## :wrench: Options

Nothing.

## :couple: Related rules

- [no-multi-str]

[no-multi-str]: https://eslint.org/docs/rules/no-multi-str

## :rocket: Version

This rule was introduced in eslint-plugin-jsonc v0.1.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/lib/rules/no-multi-str.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/tests/lib/rules/no-multi-str.ts)

<sup>Taken with ❤️ [from ESLint core](https://eslint.org/docs/rules/no-multi-str)</sup>
