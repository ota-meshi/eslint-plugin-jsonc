---
pageClass: "rule-details"
sidebarDepth: 0
title: "jsonc/key-name-casing"
description: "enforce naming convention to property key names"
since: "v0.8.0"
---
# jsonc/key-name-casing

> enforce naming convention to property key names

## :book: Rule Details

This rule enforces a naming convention to property key names.

<eslint-code-block>

<!-- eslint-skip -->

```json5
/* eslint jsonc/key-name-casing: 'error' */
{
    /* ✓ GOOD */
    "camelCase": "camelCase",

    /* ✗ BAD */
    "PascalCase": "PascalCase",
    "SCREAMING_SNAKE_CASE": "SCREAMING_SNAKE_CASE",
    "kebab-case": "kebab-case",
    "snake_case": "snake_case"
}
```

</eslint-code-block>

## :wrench: Options

```json5
{
    "jsonc/key-name-casing": ["error",
        {
            "camelCase": true,
            "PascalCase": false,
            "SCREAMING_SNAKE_CASE": false,
            "kebab-case": false,
            "snake_case": false,
            "ignores": []
        }
    ]
}
```

- `"camelCase"` ... if `true`, allows camelCase naming. default `true`
- `"PascalCase"` ... if `true`, allows PascalCase naming. default `false`
- `"SCREAMING_SNAKE_CASE"` ... if `true`, allows SCREAMING_SNAKE_CASE naming. default `false`
- `"kebab-case"` ... if `true`, allows kebab-case naming. default `false`
- `"snake_case"` ... if `true`, allows snake_case naming. default `false`
- `"ignores"` ... you can specify the patterns to ignore in the array.

## :rocket: Version

This rule was introduced in eslint-plugin-jsonc v0.8.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/lib/rules/key-name-casing.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/tests/lib/rules/key-name-casing.ts)
