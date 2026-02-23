---
pageClass: "rule-details"
sidebarDepth: 0
title: "jsonc/object-curly-spacing"
description: "enforce consistent spacing inside braces"
since: "v0.1.0"
---

# jsonc/object-curly-spacing

> enforce consistent spacing inside braces

- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule enforces consistent spacing inside braces of object literals.

<eslint-code-block fix>

<!-- eslint-skip -->

```json5
/* eslint jsonc/object-curly-spacing: 'error' */
{
    /* ✓ GOOD */
    "GOOD": {"foo": "bar"},

    /* ✗ BAD */
    "BAD": { "foo": "bar" },
}
```

</eslint-code-block>

## :wrench: Options

```json
{
    "jsonc/object-curly-spacing": ["error",
        "never",
        {
            "arraysInObjects": true,
            "objectsInObjects": true,
            "emptyObjects": "ignore"
        }
    ]
}
```

This rule has two options, a string option and an object option.

- First option:

  - `"never"` (default) disallows spacing inside of braces
  - `"always"` requires spacing inside of braces (except `{}`)

- Second option:

  - `"arraysInObjects"` control spacing inside of braces of objects beginning and/or ending with an array element.
    - `true` requires spacing inside of braces of objects beginning and/or ending with an array element (applies when the first option is set to `never`)
    - `false` disallows spacing inside of braces of objects beginning and/or ending with an array element (applies when the first option is set to `always`)
  - `"objectsInObjects"` control spacing inside of braces of objects beginning and/or ending with an object element.
    - `true` requires spacing inside of braces of objects beginning and/or ending with an object element (applies when the first option is set to `never`)
    - `false` disallows spacing inside of braces of objects beginning and/or ending with an object element (applies when the first option is set to `always`)
  - `"emptyObjects"` control spacing within empty objects.
    - `"ignore"`(default) do not check spacing in empty objects.
    - `"always"` require a space in empty objects.
    - `"never"` disallow spaces in empty objects.

These options are almost identical to those of the [@stylistic/object-curly-spacing] rule. See [here](https://eslint.style/rules/object-curly-spacing#options) for details.

## :couple: Related rules

- [@stylistic/object-curly-spacing]
- [object-curly-spacing]

[object-curly-spacing]: https://eslint.org/docs/rules/object-curly-spacing
[@stylistic/object-curly-spacing]: https://eslint.style/rules/object-curly-spacing

## :rocket: Version

This rule was introduced in eslint-plugin-jsonc v0.1.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/lib/rules/object-curly-spacing.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/tests/lib/rules/object-curly-spacing.ts)

<sup>Taken with ❤️ [from ESLint core](https://eslint.org/docs/rules/object-curly-spacing)</sup>
