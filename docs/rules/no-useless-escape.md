---
pageClass: "rule-details"
sidebarDepth: 0
title: "jsonc/no-useless-escape"
description: "disallow unnecessary escape usage"
since: "v0.1.0"
---
# jsonc/no-useless-escape

> disallow unnecessary escape usage

- :gear: This rule is included in all of `"plugin:jsonc/recommended-with-json"`, `"plugin:jsonc/recommended-with-json5"` and `"plugin:jsonc/recommended-with-jsonc"`.

## :book: Rule Details

This rule flags escapes that can be safely removed without changing behavior.

<eslint-code-block>

<!-- eslint-skip -->

```json5
/* eslint jsonc/no-useless-escape: 'error' */
{
    /* ✓ GOOD */
    "GOOD": "\"",

    /* ✗ BAD */
    "BAD": "hol\a"
}
```

</eslint-code-block>

## :wrench: Options

Nothing.

## :couple: Related rules

- [no-useless-escape]

[no-useless-escape]: https://eslint.org/docs/rules/no-useless-escape

## :rocket: Version

This rule was introduced in eslint-plugin-jsonc v0.1.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/lib/rules/no-useless-escape.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/tests/lib/rules/no-useless-escape.ts)

<sup>Taken with ❤️ [from ESLint core](https://eslint.org/docs/rules/no-useless-escape)</sup>
