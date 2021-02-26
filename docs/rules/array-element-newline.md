---
pageClass: "rule-details"
sidebarDepth: 0
title: "jsonc/array-element-newline"
description: "enforce line breaks between array elements"
since: "v0.1.0"
---
# jsonc/array-element-newline

> enforce line breaks between array elements

- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule enforces line breaks between array elements.

<eslint-code-block fix>

<!-- eslint-skip -->

```json5
/* eslint jsonc/array-element-newline: 'error' */
{
    /* ✓ GOOD */
    "GOOD": [1,
        2,
        3],

    /* ✗ BAD */
    "BAD": [1, 2, 3]
}
```

</eslint-code-block>

## :wrench: Options

```json
{
    "jsonc/array-element-newline": ["error",
        "always"
    ]
}
```

Same as [array-element-newline] rule option. See [here](https://eslint.org/docs/rules/array-element-newline#options) for details.

## :couple: Related rules

- [array-element-newline]

[array-element-newline]: https://eslint.org/docs/rules/array-element-newline

## :rocket: Version

This rule was introduced in eslint-plugin-jsonc v0.1.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/lib/rules/array-element-newline.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/tests/lib/rules/array-element-newline.ts)

<sup>Taken with ❤️ [from ESLint core](https://eslint.org/docs/rules/array-element-newline)</sup>
