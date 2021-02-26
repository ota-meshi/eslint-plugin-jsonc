---
pageClass: "rule-details"
sidebarDepth: 0
title: "jsonc/valid-json-number"
description: "disallow invalid number for JSON"
since: "v0.1.0"
---
# jsonc/valid-json-number

> disallow invalid number for JSON

- :gear: This rule is included in `"plugin:jsonc/recommended-with-json"` and `"plugin:jsonc/recommended-with-jsonc"`.
- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule reports numbers that cannot be parsed with JSON.

<eslint-code-block fix>

<!-- eslint-skip -->

```json5
/* eslint jsonc/valid-json-number: 'error' */
{
    /* ✓ GOOD */
    "GOOD": [123, 0.4, -42],

    /* ✗ BAD */
    "BAD": [123., .4, +42, Infinity, NaN]
}
```

</eslint-code-block>

## :wrench: Options

Nothing.

## :rocket: Version

This rule was introduced in eslint-plugin-jsonc v0.1.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/lib/rules/valid-json-number.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/tests/lib/rules/valid-json-number.ts)
