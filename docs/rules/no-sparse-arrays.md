---
pageClass: "rule-details"
sidebarDepth: 0
title: "jsonc/no-sparse-arrays"
description: "disallow sparse arrays"
since: "v0.2.0"
---
# jsonc/no-sparse-arrays

> disallow sparse arrays

- :gear: This rule is included in all of `"plugin:jsonc/recommended-with-json"`, `"plugin:jsonc/recommended-with-json5"` and `"plugin:jsonc/recommended-with-jsonc"`.

## :book: Rule Details

This rule disallows sparse array literals which have "holes" where commas are not preceded by elements. It does not apply to a trailing comma following the last element.

JSON, JSONC and JSON5 do not allow arrays contain empty slots.

<eslint-code-block>

<!-- eslint-skip -->

```json5
/* eslint jsonc/no-sparse-arrays: 'error' */
{
    /* ✓ GOOD */
    "GOOD": [1, 2, 3, 4],
    "GOOD": [1, 2, 3, 4,],

    /* ✗ BAD */
    "BAD": [1, , , 4],
    "BAD": [, 2, 3, 4]
}
```

</eslint-code-block>

## :wrench: Options

Nothing.

## :couple: Related rules

- [no-sparse-arrays]

[no-sparse-arrays]: https://eslint.org/docs/rules/no-sparse-arrays

## :rocket: Version

This rule was introduced in eslint-plugin-jsonc v0.2.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/lib/rules/no-sparse-arrays.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/tests/lib/rules/no-sparse-arrays.ts)

<sup>Taken with ❤️ [from ESLint core](https://eslint.org/docs/rules/no-sparse-arrays)</sup>
