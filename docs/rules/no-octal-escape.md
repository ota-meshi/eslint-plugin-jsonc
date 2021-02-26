---
pageClass: "rule-details"
sidebarDepth: 0
title: "jsonc/no-octal-escape"
description: "disallow octal escape sequences in string literals"
since: "v0.1.0"
---
# jsonc/no-octal-escape

> disallow octal escape sequences in string literals

## :book: Rule Details

This rule disallows octal escape sequences in string literals.

<eslint-code-block>

<!-- eslint-skip -->

```json5
/* eslint jsonc/no-octal-escape: 'error' */
{
    /* ✓ GOOD */
    "GOOD": "Copyright \u00A9",

    /* ✗ BAD */
    "BAD": "Copyright \251"
}
```

</eslint-code-block>

## :wrench: Options

Nothing.

## :couple: Related rules

- [no-octal-escape]

[no-octal-escape]: https://eslint.org/docs/rules/no-octal-escape

## :rocket: Version

This rule was introduced in eslint-plugin-jsonc v0.1.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/lib/rules/no-octal-escape.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/tests/lib/rules/no-octal-escape.ts)

<sup>Taken with ❤️ [from ESLint core](https://eslint.org/docs/rules/no-octal-escape)</sup>
