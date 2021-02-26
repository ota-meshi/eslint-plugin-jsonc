---
pageClass: "rule-details"
sidebarDepth: 0
title: "jsonc/no-undefined-value"
description: "disallow `undefined`"
since: "v0.2.0"
---
# jsonc/no-undefined-value

> disallow `undefined`

- :gear: This rule is included in all of `"plugin:jsonc/recommended-with-json"`, `"plugin:jsonc/recommended-with-json5"` and `"plugin:jsonc/recommended-with-jsonc"`.

## :book: Rule Details

This rule reports the use of `undefined`.

JSON, JSONC and JSON5 do not allow `undefined`.

<eslint-code-block>

<!-- eslint-skip -->

```json5
/* eslint jsonc/no-undefined-value: 'error' */
{
    /* ✗ BAD */
    "BAD": undefined
}
```

</eslint-code-block>

## :wrench: Options

Nothing.

## :rocket: Version

This rule was introduced in eslint-plugin-jsonc v0.2.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/lib/rules/no-undefined-value.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/tests/lib/rules/no-undefined-value.ts)
