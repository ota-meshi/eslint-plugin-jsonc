---
pageClass: "rule-details"
sidebarDepth: 0
title: "jsonc/no-bigint-literals"
description: "disallow BigInt literals"
since: "v0.2.0"
---
# jsonc/no-bigint-literals

> disallow BigInt literals

- :gear: This rule is included in all of `"plugin:jsonc/recommended-with-json"`, `"plugin:jsonc/recommended-with-json5"` and `"plugin:jsonc/recommended-with-jsonc"`.

## :book: Rule Details

This rule reports the use of BigInt literals.

JSON, JSONC and JSON5 do not allow BigInt literals.

<eslint-code-block>

<!-- eslint-skip -->

```json5
/* eslint jsonc/no-bigint-literals: 'error' */
{
    /* ✓ GOOD */
    "GOOD": 42,

    /* ✗ BAD */
    "BAD": 42n
}
```

</eslint-code-block>

## :wrench: Options

Nothing.

## :rocket: Version

This rule was introduced in eslint-plugin-jsonc v0.2.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/lib/rules/no-bigint-literals.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/tests/lib/rules/no-bigint-literals.ts)
