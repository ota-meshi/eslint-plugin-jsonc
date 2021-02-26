---
pageClass: "rule-details"
sidebarDepth: 0
title: "jsonc/array-bracket-spacing"
description: "disallow or enforce spaces inside of brackets"
since: "v0.1.0"
---
# jsonc/array-bracket-spacing

> disallow or enforce spaces inside of brackets

- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule enforces consistent spacing inside array brackets.

<eslint-code-block fix>

<!-- eslint-skip -->

```json5
/* eslint jsonc/array-bracket-spacing: 'error' */
{
    /* ✓ GOOD */
    "GOOD": [1, 2, 3],

    /* ✗ BAD */
    "BAD": [ 1, 2, 3 ]
}
```

</eslint-code-block>

## :wrench: Options

```json
{
    "jsonc/array-bracket-spacing": ["error",
        "never"
    ]
}
```

Same as [array-bracket-spacing] rule option. See [here](https://eslint.org/docs/rules/array-bracket-spacing#options) for details.

## :couple: Related rules

- [array-bracket-spacing]

[array-bracket-spacing]: https://eslint.org/docs/rules/array-bracket-spacing

## :rocket: Version

This rule was introduced in eslint-plugin-jsonc v0.1.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/lib/rules/array-bracket-spacing.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/tests/lib/rules/array-bracket-spacing.ts)

<sup>Taken with ❤️ [from ESLint core](https://eslint.org/docs/rules/array-bracket-spacing)</sup>
