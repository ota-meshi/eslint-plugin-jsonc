---
pageClass: "rule-details"
sidebarDepth: 0
title: "jsonc/no-nan"
description: "disallow NaN"
---
# jsonc/no-nan

> disallow NaN

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> ***This rule has not been released yet.*** </badge>

## :book: Rule Details

This rule reports the use of NaN.

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

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/lib/rules/no-nan.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/tests/lib/rules/no-nan.ts)
