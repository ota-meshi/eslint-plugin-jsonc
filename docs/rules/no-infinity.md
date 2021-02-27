---
pageClass: "rule-details"
sidebarDepth: 0
title: "jsonc/no-infinity"
description: "disallow Infinity"
---
# jsonc/no-infinity

> disallow Infinity

- :exclamation: <badge text="This rule has not been released yet." vertical="middle" type="error"> ***This rule has not been released yet.*** </badge>

## :book: Rule Details

This rule reports the use of Infinity.

<eslint-code-block>

<!-- eslint-skip -->

```json5
/* eslint jsonc/no-infinity: 'error' */
{
    /* ✓ GOOD */
    "GOOD": 42,

    /* ✗ BAD */
    "BAD": Infinity
}
```

</eslint-code-block>

## :wrench: Options

Nothing.

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/lib/rules/no-infinity.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/tests/lib/rules/no-infinity.ts)
