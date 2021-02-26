---
pageClass: "rule-details"
sidebarDepth: 0
title: "jsonc/no-dupe-keys"
description: "disallow duplicate keys in object literals"
since: "v0.1.0"
---
# jsonc/no-dupe-keys

> disallow duplicate keys in object literals

- :gear: This rule is included in all of `"plugin:jsonc/recommended-with-json"`, `"plugin:jsonc/recommended-with-json5"` and `"plugin:jsonc/recommended-with-jsonc"`.

## :book: Rule Details

This rule disallows duplicate keys in object literals.

<eslint-code-block>

<!-- eslint-skip -->

```json5
/* eslint jsonc/no-dupe-keys: 'error' */
{
    /* ✓ GOOD */
    "GOOD": {
        "foo": "val",
        "bar": "val"
    },

    /* ✗ BAD */
    "BAD": {
        "foo": "val",
        "foo": "val"
    }
}
```

</eslint-code-block>

## :wrench: Options

Nothing.

## :couple: Related rules

- [no-dupe-keys]

[no-dupe-keys]: https://eslint.org/docs/rules/no-dupe-keys

## :rocket: Version

This rule was introduced in eslint-plugin-jsonc v0.1.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/lib/rules/no-dupe-keys.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/tests/lib/rules/no-dupe-keys.ts)

<sup>Taken with ❤️ [from ESLint core](https://eslint.org/docs/rules/no-dupe-keys)</sup>
