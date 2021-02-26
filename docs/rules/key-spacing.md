---
pageClass: "rule-details"
sidebarDepth: 0
title: "jsonc/key-spacing"
description: "enforce consistent spacing between keys and values in object literal properties"
since: "v0.1.0"
---
# jsonc/key-spacing

> enforce consistent spacing between keys and values in object literal properties

- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule enforces consistent spacing between keys and values in object literal properties. In the case of long lines, it is acceptable to add a new line wherever whitespace is allowed.

<eslint-code-block fix>

<!-- eslint-skip -->

```json5
/* eslint jsonc/key-spacing: 'error' */
{
    /* ✓ GOOD */
    "GOOD": "foo",

    /* ✗ BAD */
    "BAD" :"bar"
}
```

</eslint-code-block>

## :wrench: Options

```json
{
    "jsonc/key-spacing": ["error",
        {
            "beforeColon": false,
            "afterColon": true,
            "mode": "strict"
        }
    ]
}
```

Same as [key-spacing] rule option. See [here](https://eslint.org/docs/rules/key-spacing#options) for details. 

## :couple: Related rules

- [key-spacing]

[key-spacing]: https://eslint.org/docs/rules/key-spacing

## :rocket: Version

This rule was introduced in eslint-plugin-jsonc v0.1.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/lib/rules/key-spacing.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/tests/lib/rules/key-spacing.ts)

<sup>Taken with ❤️ [from ESLint core](https://eslint.org/docs/rules/key-spacing)</sup>
