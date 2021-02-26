---
pageClass: "rule-details"
sidebarDepth: 0
title: "jsonc/object-curly-newline"
description: "enforce consistent line breaks inside braces"
since: "v0.1.0"
---
# jsonc/object-curly-newline

> enforce consistent line breaks inside braces

- :wrench: The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

## :book: Rule Details

This rule enforces consistent line breaks inside braces of object literals.

<eslint-code-block fix>

<!-- eslint-skip -->

```json5
/* eslint jsonc/object-curly-newline: 'error' */
{
    /* ✓ GOOD */
    "GOOD": {"foo": "bar"},
    "GOOD": {
        "foo": "bar"
    },

    /* ✗ BAD */
    "BAD": {"foo": "bar"
    },
    "BAD": {
      "foo": "bar"}
}
```

</eslint-code-block>

## :wrench: Options

```json
{
    "jsonc/object-curly-newline": ["error",
        {
            "consistent": true
        }
    ]
}
```

Same as [object-curly-newline] rule option. See [here](https://eslint.org/docs/rules/object-curly-newline#options) for details.

## :couple: Related rules

- [object-curly-newline]

[object-curly-newline]: https://eslint.org/docs/rules/object-curly-newline

## :rocket: Version

This rule was introduced in eslint-plugin-jsonc v0.1.0

## :mag: Implementation

- [Rule source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/lib/rules/object-curly-newline.ts)
- [Test source](https://github.com/ota-meshi/eslint-plugin-jsonc/blob/master/tests/lib/rules/object-curly-newline.ts)

<sup>Taken with ❤️ [from ESLint core](https://eslint.org/docs/rules/object-curly-newline)</sup>
