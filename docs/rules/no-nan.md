---
pageClass: "rule-details"
sidebarDepth: 0
title: "jsonc/no-nan"
description: "disallow NaN"
since: "v1.1.0"
---
# jsonc/no-nan

> disallow NaN

- :gear: This rule is included in `"plugin:jsonc/recommended-with-json"` and `"plugin:jsonc/recommended-with-jsonc"`.

## :book: Rule Details

This rule reports the use of NaN.

Cannot use NaN when in JSON and JSONC.

<eslint-code-block>

<!-- eslint-skip -->

```json5
/* eslint jsonc/no-nan: 'error' */
{
    /* ✓ GOOD */
    "GOOD": 42,

    /* ✗ BAD */
    "BAD": NaN
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

- [Rule source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/lib/rules/no-nan.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/tests/lib/rules/no-nan.ts)
