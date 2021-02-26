---
pageClass: "rule-details"
sidebarDepth: 0
title: "jsonc/no-regexp-literals"
description: "disallow RegExp literals"
since: "v0.2.0"
---
# jsonc/no-regexp-literals

> disallow RegExp literals

- :gear: This rule is included in all of `"plugin:jsonc/recommended-with-json"`, `"plugin:jsonc/recommended-with-json5"` and `"plugin:jsonc/recommended-with-jsonc"`.

## :book: Rule Details

This rule reports the use of RegExp literals.

JSON, JSONC and JSON5 do not allow RegExp literals.

<eslint-code-block>

<!-- eslint-skip -->

```json5
/* eslint jsonc/no-regexp-literals: 'error' */
{
    /* ✗ BAD */
    "BAD": /foo/
}
```

</eslint-code-block>

## :wrench: Options

Nothing.

## :rocket: Version

This rule was introduced in eslint-plugin-jsonc v0.2.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/lib/rules/no-regexp-literals.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/tests/lib/rules/no-regexp-literals.ts)
