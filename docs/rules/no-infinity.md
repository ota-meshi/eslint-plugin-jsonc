---
pageClass: "rule-details"
sidebarDepth: 0
title: "jsonc/no-infinity"
description: "disallow Infinity"
since: "v1.1.0"
---
# jsonc/no-infinity

> disallow Infinity

- :gear: This rule is included in `"plugin:jsonc/recommended-with-json"` and `"plugin:jsonc/recommended-with-jsonc"`.

## :book: Rule Details

This rule reports the use of Infinity.

Cannot use Infinity when in JSON and JSONC.

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

## :couple: Related rules

- [jsonc/valid-json-number]

[jsonc/valid-json-number]: ./valid-json-number.md

## :rocket: Version

This rule was introduced in eslint-plugin-jsonc v1.1.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/lib/rules/no-infinity.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/tests/lib/rules/no-infinity.ts)
