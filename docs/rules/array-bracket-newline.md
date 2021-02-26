---
pageClass: "rule-details"
sidebarDepth: 0
title: "jsonc/array-bracket-newline"
description: "enforce line breaks after opening and before closing array brackets"
since: "v0.1.0"
---
# jsonc/array-bracket-newline

> enforce line breaks after opening and before closing array brackets

- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule enforces line breaks after opening and before closing array brackets.

<eslint-code-block fix>

<!-- eslint-skip -->

```json5
/* eslint jsonc/array-bracket-newline: 'error' */
{
    /* ✓ GOOD */
    "GOOD": [1, 2, 3],
    "GOOD": [
        1,
        2,
        3
    ],

    /* ✗ BAD */
    "BAD": [
        1, 2, 3
    ],
    "BAD": [1,
        2, 3]
}
```

</eslint-code-block>

## :wrench: Options

```json
{
    "jsonc/array-bracket-newline": ["error",
        {
            "multiline": true,
            "minItems": null
        }
    ]
}
```

Same as [array-bracket-newline] rule option. See [here](https://eslint.org/docs/rules/array-bracket-newline#options) for details.

## :couple: Related rules

- [array-bracket-newline]

[array-bracket-newline]: https://eslint.org/docs/rules/array-bracket-newline

## :rocket: Version

This rule was introduced in eslint-plugin-jsonc v0.1.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/lib/rules/array-bracket-newline.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/tests/lib/rules/array-bracket-newline.ts)

<sup>Taken with ❤️ [from ESLint core](https://eslint.org/docs/rules/array-bracket-newline)</sup>
