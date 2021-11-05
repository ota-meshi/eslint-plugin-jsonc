---
pageClass: "rule-details"
sidebarDepth: 0
title: "jsonc/no-unicode-codepoint-escapes"
description: "disallow Unicode code point escape sequences."
since: "v1.1.0"
---
# jsonc/no-unicode-codepoint-escapes

> disallow Unicode code point escape sequences.

- :gear: This rule is included in all of `"plugin:jsonc/recommended-with-json"`, `"plugin:jsonc/recommended-with-json5"` and `"plugin:jsonc/recommended-with-jsonc"`.
- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule disallow Unicode code point escape sequences.

<eslint-code-block fix>

<!-- eslint-skip -->

```json5
/* eslint jsonc/no-unicode-codepoint-escapes: 'error' */
{
    /* ✓ GOOD */
    "GOOD": "\u0041",

    /* ✗ BAD */
    "BAD": "\u{41}"
}
```

</eslint-code-block>

## :wrench: Options

Nothing.

## :rocket: Version

This rule was introduced in eslint-plugin-jsonc v1.1.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/lib/rules/no-unicode-codepoint-escapes.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/tests/lib/rules/no-unicode-codepoint-escapes.ts)
