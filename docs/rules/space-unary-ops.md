---
pageClass: "rule-details"
sidebarDepth: 0
title: "jsonc/space-unary-ops"
description: "disallow spaces after unary operators"
since: "v0.2.0"
---
# jsonc/space-unary-ops

> disallow spaces after unary operators

- :gear: This rule is included in all of `"plugin:jsonc/recommended-with-json"`, `"plugin:jsonc/recommended-with-json5"` and `"plugin:jsonc/recommended-with-jsonc"`.
- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule reports the space after the sign operator.  

JSON, JSONC and JSON5 do not allow spaces after the sign.

<eslint-code-block fix>

<!-- eslint-skip -->

```json5
/* eslint jsonc/space-unary-ops: 'error' */
{
    /* ✓ GOOD */
    "GOOD": -42,

    /* ✗ BAD */
    "BAD": -  42
}
```

</eslint-code-block>

## :wrench: Options

Nothing.

## :couple: Related rules

- [space-unary-ops]
- [jsonc/valid-json-number]

[space-unary-ops]: https://eslint.org/docs/rules/space-unary-ops
[jsonc/valid-json-number]: ./valid-json-number.md

## :rocket: Version

This rule was introduced in eslint-plugin-jsonc v0.2.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/lib/rules/space-unary-ops.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/tests/lib/rules/space-unary-ops.ts)

<sup>Taken with ❤️ [from ESLint core](https://eslint.org/docs/rules/space-unary-ops)</sup>
